import { InvalidWebhookSignatureError, MercadoPagoConfig, Payment, Preference, WebhookSignatureValidator } from "mercadopago";
import type { Request, Response } from "express";
import { MAX_INSTALLMENTS, PRICE_IN_CENTS } from "@shared/product";
import { getAssessmentById, getCompanyById, markAssessmentPaid as markAssessmentPaidInDb } from "./db";
import { appUrl, sendPaymentReceivedOwnerEmail } from "./email";

/**
 * Pagamento via Mercado Pago Checkout Pro.
 *
 * Variáveis de ambiente:
 *   MERCADOPAGO_ACCESS_TOKEN    Access Token da aplicação (TEST-… em testes, APP_USR-… em produção)
 *   MERCADOPAGO_WEBHOOK_SECRET  Assinatura secreta gerada em Suas integrações > Webhooks
 *
 * Parcelamento: a preferência libera até MAX_INSTALLMENTS parcelas. Quantas são sem juros
 * (por conta da vendedora) é definido na conta Mercado Pago, em "Parcelamento sem juros".
 * As colunas stripe* do banco foram mantidas para evitar migração e guardam os IDs do Mercado Pago.
 */

function config() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Mercado Pago não está configurado.");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
}

function browserOrigin(req: Request) {
  const origin = req.get("origin");
  if (origin) return origin;
  const referer = req.get("referer");
  if (referer) return new URL(referer).origin;
  const fallback = appUrl();
  if (fallback) return fallback;
  throw new Error("Não foi possível identificar o endereço público do site.");
}

/** Libera a avaliação como paga (uma única vez) e avisa a responsável. Usado pelo Mercado Pago e pelos cupons. */
export async function markAssessmentPaid(assessmentId: number, paymentId: string | null) {
  const firstConfirmation = await markAssessmentPaidInDb(assessmentId, paymentId);
  if (!firstConfirmation) return;
  const assessment = await getAssessmentById(assessmentId);
  const company = assessment ? await getCompanyById(assessment.companyId) : null;
  await sendPaymentReceivedOwnerEmail({ companyName: company?.name, baseUrl: appUrl() });
}

export async function createAssessmentCheckout(req: Request, user: { id: number; name?: string | null; email?: string | null }, assessmentId: number, priceInCents: number = PRICE_IN_CENTS) {
  const origin = browserOrigin(req);
  const back = `${origin}/resultado/${assessmentId}`;
  const preference = await new Preference(config()).create({
    body: {
      items: [{
        id: "diagnostico-estrategico-360",
        title: "Diagnóstico Estratégico 360º",
        description: "Diagnóstico estratégico com relatório personalizado",
        quantity: 1,
        unit_price: priceInCents / 100,
        currency_id: "BRL",
      }],
      payer: user.email ? { email: user.email, name: user.name ?? undefined } : undefined,
      external_reference: String(assessmentId),
      metadata: { assessment_id: String(assessmentId), user_id: String(user.id) },
      // Boleto e pagamento em lotérica desativados: apenas cartão e Pix.
      payment_methods: { installments: MAX_INSTALLMENTS, excluded_payment_types: [{ id: "ticket" }, { id: "atm" }] },
      back_urls: { success: `${back}?payment=success`, pending: `${back}?payment=pending`, failure: `${back}?payment=failure` },
      auto_return: "approved",
      notification_url: `${origin}/api/mercadopago/webhook`,
      statement_descriptor: "DIAGNOSTICO360",
    },
  });
  if (!preference.id || !preference.init_point) throw new Error("Não foi possível iniciar o pagamento.");
  return { id: preference.id, url: preference.init_point };
}

/** Consulta o pagamento na API (fonte da verdade) e libera a avaliação se estiver aprovado. */
async function syncPayment(paymentId: string, expectedAssessmentId?: number) {
  const payment = await new Payment(config()).get({ id: paymentId });
  const assessmentId = Number(payment.external_reference);
  if (!Number.isInteger(assessmentId)) return false;
  if (expectedAssessmentId !== undefined && assessmentId !== expectedAssessmentId) return false;
  if (payment.status !== "approved") return false;
  await markAssessmentPaid(assessmentId, String(payment.id));
  return true;
}

export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  const query = req.query as Record<string, string | undefined>;
  const body = (req.body ?? {}) as { type?: string; topic?: string; data?: { id?: string | number } };
  const type = query.type ?? query.topic ?? body.type ?? body.topic;
  const dataId = query["data.id"] ?? query.id ?? (body.data?.id !== undefined ? String(body.data.id) : undefined);

  // Notificações assinadas (Webhooks) são validadas; o pagamento é sempre reconsultado na API,
  // então uma notificação falsa nunca libera um diagnóstico.
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret && req.get("x-signature")) {
    try {
      WebhookSignatureValidator.validate({ xSignature: req.get("x-signature"), xRequestId: req.get("x-request-id"), dataId: query["data.id"] ?? dataId, secret });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        console.warn("[MercadoPago] Assinatura inválida", error.reason, error.requestId);
        return res.status(401).send("Assinatura inválida.");
      }
      throw error;
    }
  }

  if (type !== "payment" || !dataId) return res.status(200).json({ received: true, ignored: true });

  try {
    await syncPayment(dataId);
  } catch (error) {
    // Pagamento inexistente (ex.: "Simular notificação" do painel): responde OK para o Mercado Pago não reenviar.
    if ((error as { status?: number })?.status === 404) return res.status(200).json({ received: true, ignored: true });
    console.error("[MercadoPago] Falha ao processar notificação", error);
    return res.status(500).send("Falha ao processar notificação.");
  }
  return res.status(200).json({ received: true });
}

/** Chamado quando o cliente volta do checkout com ?payment_id=… */
export async function confirmAssessmentCheckout(paymentId: string, assessmentId: number) {
  return syncPayment(paymentId, assessmentId);
}
