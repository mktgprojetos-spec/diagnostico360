import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { DIAGNOSTIC_VERSION } from "@shared/diagnostic";
import { addReview, createAssessment, getAnswers, getAssessmentById, getAssessmentForUser, getAssessmentsForUser, getCompanyById, getCompanyForUser, getDb, saveAnswers, saveCompany, setCheckoutSession } from "./db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { assessments } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { createAssessmentCheckout } from "./stripe";
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_OPTIONS, createAdminSession, verifyAdminCredentials } from "./adminAuth";

const companyInput = z.object({
  name: z.string().min(2).max(180),
  responsibleName: z.string().min(2).max(180),
  email: z.union([z.string().email().max(320), z.literal("")]).optional().transform(value => value || null),
  phone: z.string().min(8).max(32),
  socialUrl: z.string().max(320).optional().or(z.literal("")),
  sector: z.string().min(2).max(160),
  size: z.string().min(1).max(80),
  stage: z.string().min(1).max(100),
  challenge: z.string().min(10).max(2000),
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
      return createAssessment(ctx.user.id, company.id, DIAGNOSTIC_VERSION);
    }),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.id);
      const answers = await getAnswers(assessment.id);
      return { assessment, answers };
    }),
    save: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), answers: answersInput, currentStep: z.number().int().min(0).max(8) })).mutation(async ({ ctx, input }) => {
      await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      const result = await saveAnswers(input.assessmentId, input.answers, input.currentStep, "draft");
      return { saved: true, result };
    }),
    submit: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), answers: answersInput })).mutation(async ({ ctx, input }) => {
      await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      const result = await saveAnswers(input.assessmentId, input.answers, 8, "submitted");
      return { submitted: true, result };
    }),
    paymentStatus: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.id);
      return { paymentStatus: assessment.paymentStatus, status: assessment.status };
    }),
    checkout: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.assessmentId);
      if (assessment.status === "draft") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Finalize o preenchimento do diagnóstico antes de realizar o pagamento." });
      if (assessment.paymentStatus === "paid") return { paid: true as const, url: null };
      const session = await createAssessmentCheckout(ctx.req, ctx.user, assessment.id);
      if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível iniciar o pagamento." });
      await setCheckoutSession(assessment.id, session.id);
      return { paid: false as const, url: session.url };
    }),
    result: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const assessment = await requireAssessmentOwner(ctx.user.id, input.id);
      if (assessment.paymentStatus !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Conclua o pagamento para acessar o resultado completo." });
      const answers = await getAnswers(assessment.id);
      const { calculateDiagnostic } = await import("./diagnostic");
      const answerMap = Object.fromEntries(answers.map(answer => [answer.questionId, answer.value]));
      return { assessment, answers, result: calculateDiagnostic(answerMap) };
    }),
  }),
  admin: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });
      return db.select().from(assessments).orderBy(desc(assessments.updatedAt));
    }),
    detail: adminProcedure.input(z.object({ assessmentId: z.number().int().positive() })).query(async ({ input }) => {
      const assessment = await getAssessmentById(input.assessmentId);
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada." });
      const answers = await getAnswers(assessment.id);
      const company = await getCompanyById(assessment.companyId);
      const { calculateDiagnostic } = await import("./diagnostic");
      const answerMap = Object.fromEntries(answers.map(answer => [answer.questionId, answer.value]));
      return { assessment, answers, company, result: calculateDiagnostic(answerMap) };
    }),
    approve: adminProcedure.input(z.object({ assessmentId: z.number().int().positive(), status: z.enum(["needs_review", "approved"]), note: z.string().max(2000).nullable() })).mutation(({ ctx, input }) => addReview(input.assessmentId, ctx.user.id, input.status, input.note)),
  }),
});

export type AppRouter = typeof appRouter;
