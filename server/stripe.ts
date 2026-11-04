import Stripe from "stripe";
import type { Request, Response } from "express";
import { markAssessmentPaid, recordStripeEvent } from "./db";

const PRICE_IN_CENTS = 49700;

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe não está configurado.");
  return new Stripe(secretKey);
}

function browserOrigin(req: Request) {
  const origin = req.get("origin");
  if (origin) return origin;
  const referer = req.get("referer");
  if (referer) return new URL(referer).origin;
  throw new Error("Não foi possível identificar a origem pública do Checkout.");
}

export async function createAssessmentCheckout(req: Request, user: { id: number; name?: string | null; email?: string | null }, assessmentId: number) {
  const stripe = stripeClient();
  const origin = browserOrigin(req);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    client_reference_id: String(user.id),
    customer_email: user.email ?? undefined,
    line_items: [{
      price_data: {
        currency: "brl",
        unit_amount: PRICE_IN_CENTS,
        product_data: { name: "Raio-X Estratégico 360", description: "Diagnóstico estratégico guiado com relatório personalizado" },
      },
      quantity: 1,
    }],
    metadata: {
      assessment_id: String(assessmentId),
      user_id: String(user.id),
      customer_name: user.name ?? "",
      customer_email: user.email ?? "",
    },
    success_url: `${origin}/resultado/${assessmentId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/resultado/${assessmentId}?payment=cancel`,
  });
  return session;
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return res.status(400).send("Webhook Stripe não configurado.");

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(req.body as Buffer, signature, webhookSecret);
  } catch (error) {
    console.error("[Stripe] Invalid webhook signature", error);
    return res.status(400).send("Assinatura Stripe inválida.");
  }

  try {
    const firstDelivery = await recordStripeEvent(event.id, event.type);
    if (!firstDelivery) return res.json({ received: true, duplicate: true });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const assessmentId = Number(session.metadata?.assessment_id);
      if (Number.isInteger(assessmentId) && session.payment_status === "paid") {
        await markAssessmentPaid(assessmentId, typeof session.payment_intent === "string" ? session.payment_intent : null);
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const assessmentId = Number(intent.metadata?.assessment_id);
      if (Number.isInteger(assessmentId)) await markAssessmentPaid(assessmentId, intent.id);
    }
  } catch (error) {
    console.error("[Stripe] Webhook processing failed", error);
    return res.status(500).send("Falha ao processar evento Stripe.");
  }

  return res.json({ received: true });
}

export async function confirmAssessmentCheckout(sessionId: string, assessmentId: number) {
  const session = await stripeClient().checkout.sessions.retrieve(sessionId);
  const sessionAssessmentId = Number(session.metadata?.assessment_id);
  if (sessionAssessmentId !== assessmentId || session.payment_status !== "paid") return false;
  await markAssessmentPaid(assessmentId, typeof session.payment_intent === "string" ? session.payment_intent : null);
  return true;
}

export { PRICE_IN_CENTS };
