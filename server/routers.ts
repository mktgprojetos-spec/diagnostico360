import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { DIAGNOSTIC_VERSION } from "@shared/diagnostic";
import { addReview, createAssessment, getAnswers, getAssessmentById, getAssessmentForUser, getAssessmentsForUser, getCompanyById, getCompanyForUser, getUserById, getDb, getLatestSubmittedAssessment, saveAnswers, saveCompany, setCheckoutSession } from "./db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { assessments, companies, users } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { confirmAssessmentCheckout, createAssessmentCheckout, markAssessmentPaid } from "./mercadopago";
import { checkCoupon, couponPaymentId } from "./coupons";
import { calculateDiagnostic } from "./diagnostic";
import { appUrl, sendReportReleasedEmail } from "./email";
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS, createAdminSession, verifyAdminCredentials } from "./adminAuth";

const companyInput = z.object({
  name: z.string().min(2).max(180),
  responsibleName: z.string().min(2).max(180),
  email: z.union([z.string().email().max(320), z.literal("")]).optional().transform(value => value || null),
  phone: z.string().min(8).max(32),
  socialUrl: z.string().max(320).optional().or(z.literal("")),
  sector: z.string().min(2).max(160),
  size: z.string().min(1).max(80),
});

const answersInput = z.record(z.string(), z.number().int().min(0).max(4).nullable());

function requireAssessmentOwner(userId: number, assessmentId: number) {
  return getAssessmentForUser(assessmentId, userId).then(assessment => {
    if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada." });
    return assessment;
  });
}

export const appRouter = router({
  system: router({
    health: publicProcedure.query(() => ({ status: "ok" as const })),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    adminLogin: publicProcedure.input(z.object({ username: z.string().min(1).max(64), password: z.string().min(1).max(200) })).mutation(({ ctx, input }) => {
      if (!verifyAdminCredentials(input.username, input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha administrativa inválidos." });
      ctx.res.cookie(ADMIN_COOKIE_NAME, createAdminSession(), ADMIN_COOKIE_OPTIONS);
      return { success: true as const };
    }),
    adminLogout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...ADMIN_COOKIE_OPTIONS, maxAge: 0 });
      return { success: true as const };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  company: router({
    current: protectedProcedure.query(({ ctx }) => getCompanyForUser(ctx.user.id)),
    save: protectedProcedure.input(companyInput).mutation(({ ctx, input }) => saveCompany(ctx.user.id, input)),
  }),
  assessment: router({
    latest: protectedProcedure.query(async ({ ctx }) => {
      const list = await getAssessmentsForUser(ctx.user.id);
      const assessment = list[0] ?? null;
      if (!assessment) return null;
      const answers = await getAnswers(assessment.id);
      return { assessment, answers };
    }),
    list: protectedProcedure.query(({ ctx }) => getAssessmentsForUser(ctx.user.id)),
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const company = await getCompanyForUser(ctx.user.id);
      if (!company) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Cadastre a empresa antes de iniciar." });
      const latestSubmitted = await getLatestSubmittedAssessment(ctx.user.id);
      // Administradoras podem criar diagnósticos de teste a qualquer momento.
      if (latestSubmitted?.submittedAt && ctx.user.role !== "admin") {
        const availableAt = latestSubmitted.submittedAt.getTime() + 90 * 24 * 60 * 60 * 1000;
        if (Date.now() < availableAt) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Uma nova avaliação estará disponível a partir de ${new Date(availableAt).toLocaleDateString("pt-BR")}. Para revisar cenários antes disso, agende o Planejamento Estratégico Inteligente.` });
      }
      return createAssessment(ctx.user.id, company.id, DIAGNOSTIC_VERSION);
    }),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.id);
      const answers = await getAnswers(assessment.id);
      return { assessment, answers };
    }),
    save: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), answers: answersInput, currentStep: z.number().int().min(0).max(9), contextMoments: z.array(z.string().min(1).max(120)).max(3), contextChallenge: z.string().min(10).max(2000), contextExpectation: z.string().min(10).max(1000) })).mutation(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      if (assessment.status !== "draft") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Este diagnóstico já foi finalizado. Para corrigir uma informação, envie uma solicitação administrativa." });
      const result = await saveAnswers(input.assessmentId, input.answers, input.currentStep, "draft", input, assessment.version);
      return { saved: true, result };
    }),
    submit: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), answers: answersInput, contextMoments: z.array(z.string().min(1).max(120)).max(3), contextChallenge: z.string().min(10).max(2000), contextExpectation: z.string().min(10).max(1000) })).mutation(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      if (assessment.status !== "draft") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Este diagnóstico já foi finalizado." });
      const validationResult = calculateDiagnostic(input.answers, assessment.version);
      const scoredAnswers = Object.values(input.answers).filter(value => typeof value === "number").length;
      if (scoredAnswers < 18 || validationResult.overallScore === null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Responda pelo menos 18 perguntas e complete 6 dimensões para enviar o diagnóstico." });
      const result = await saveAnswers(input.assessmentId, input.answers, 9, "submitted", input, assessment.version);
      return { submitted: true, result };
    }),
    paymentStatus: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.id);
      return { paymentStatus: assessment.paymentStatus, status: assessment.status, paidAt: assessment.paidAt };
    }),
    confirmPayment: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), paymentId: z.string().regex(/^\d{1,30}$/) })).mutation(async ({ ctx, input }) => {
      await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      const paid = await confirmAssessmentCheckout(input.paymentId, input.assessmentId);
      return { paid };
    }),
    applyCoupon: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), code: z.string().min(2).max(40) })).mutation(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      if (assessment.status === "draft") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Finalize o preenchimento do diagnóstico antes de usar o cupom." });
      const check = checkCoupon(input.code);
      if (!check.ok) throw new TRPCError({ code: "BAD_REQUEST", message: check.message });
      if (assessment.paymentStatus === "paid") return { paid: true as const, percentOff: check.coupon.percentOff, priceInCents: 0 };
      if (check.priceInCents === 0) {
        await markAssessmentPaid(assessment.id, couponPaymentId(check.coupon));
        return { paid: true as const, percentOff: check.coupon.percentOff, priceInCents: 0 };
      }
      return { paid: false as const, percentOff: check.coupon.percentOff, priceInCents: check.priceInCents };
    }),
    checkout: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), couponCode: z.string().max(40).optional() })).mutation(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      if (assessment.status === "draft") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Finalize o preenchimento do diagnóstico antes de realizar o pagamento." });
      if (assessment.paymentStatus === "paid") return { paid: true as const, url: null };
      let priceInCents: number | undefined;
      if (input.couponCode) {
        const check = checkCoupon(input.couponCode);
        if (!check.ok) throw new TRPCError({ code: "BAD_REQUEST", message: check.message });
        if (check.priceInCents === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Este cupom zera o valor: use o botão Aplicar cupom." });
        priceInCents = check.priceInCents;
      }
      const session = await createAssessmentCheckout(ctx.req, ctx.user, assessment.id, priceInCents);
      await setCheckoutSession(assessment.id, session.id);
      return { paid: false as const, url: session.url };
    }),
    result: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.id);
      if (assessment.paymentStatus !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Conclua o pagamento para acessar o resultado completo." });
      if (assessment.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "O relatório está em revisão e será liberado após a aprovação." });
      const answers = await getAnswers(assessment.id);
      const { calculateDiagnostic } = await import("./diagnostic");
      const answerMap = Object.fromEntries(answers.map(answer => [answer.questionId, answer.value]));
      const company = await getCompanyById(assessment.companyId);
      return { assessment, answers, companyName: company?.name ?? null, result: calculateDiagnostic(answerMap, assessment.version) };
    }),
  }),
  admin: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });
      const rows = await db.select({ assessment: assessments, companyName: companies.name, responsibleName: companies.responsibleName, phone: companies.phone, ownerRole: users.role }).from(assessments).leftJoin(companies, eq(assessments.companyId, companies.id)).leftJoin(users, eq(assessments.userId, users.id)).orderBy(desc(assessments.updatedAt));
      // Diagnósticos feitos por contas administradoras são testes e ficam fora das métricas.
      return rows.map(row => ({ ...row.assessment, companyName: row.companyName, responsibleName: row.responsibleName, phone: row.phone, isTest: row.ownerRole === "admin" }));
    }),
    detail: adminProcedure.input(z.object({ assessmentId: z.number().int().positive() })).query(async ({ input }) => {
      const assessment = await getAssessmentById(input.assessmentId);
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada." });
      const answers = await getAnswers(assessment.id);
      const company = await getCompanyById(assessment.companyId);
      const { calculateDiagnostic } = await import("./diagnostic");
      const answerMap = Object.fromEntries(answers.map(answer => [answer.questionId, answer.value]));
      return { assessment, answers, company, result: calculateDiagnostic(answerMap, assessment.version) };
    }),
    approve: adminProcedure.input(z.object({ assessmentId: z.number().int().positive(), status: z.enum(["needs_review", "approved"]), note: z.string().max(2000).nullable() })).mutation(async ({ ctx, input }) => {
      const before = await getAssessmentById(input.assessmentId);
      if (!before) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada." });
      await addReview(input.assessmentId, ctx.user.id, input.status, input.note);
      if (input.status !== "approved" || before.status === "approved") return { approved: input.status === "approved", emailSent: false, emailTo: null };
      const company = await getCompanyById(before.companyId);
      const owner = await getUserById(before.userId);
      const emailTo = company?.email || owner?.email || null;
      const emailSent = emailTo ? await sendReportReleasedEmail({ to: emailTo, responsibleName: company?.responsibleName ?? owner?.name, assessmentId: before.id, baseUrl: appUrl(ctx.req.get("origin")) }) : false;
      return { approved: true, emailSent, emailTo };
    }),
  }),
});

export type AppRouter = typeof appRouter;
