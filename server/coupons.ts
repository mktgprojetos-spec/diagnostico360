import { PRICE_IN_CENTS } from "@shared/product";

/**
 * Cupons de desconto. Ficam só no servidor (o código do cupom não vai para o navegador).
 * percentOff = 100 libera o diagnóstico sem passar pelo Mercado Pago (valor zerado).
 * expiresAt é o último instante válido, no horário de Brasília.
 */
export type Coupon = { code: string; percentOff: number; expiresAt: Date; label: string };

export const COUPONS: Coupon[] = [
  { code: "CMEC100", percentOff: 100, expiresAt: new Date("2026-11-30T23:59:59-03:00"), label: "Cupom CMEC100 (100%)" },
];

export type CouponCheck =
  | { ok: true; coupon: Coupon; priceInCents: number }
  | { ok: false; message: string };

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function checkCoupon(rawCode: string, now: Date = new Date()): CouponCheck {
  const code = normalizeCouponCode(rawCode);
  const coupon = COUPONS.find(item => item.code === code);
  if (!coupon) return { ok: false, message: "Cupom inválido." };
  if (now.getTime() > coupon.expiresAt.getTime()) return { ok: false, message: "Este cupom expirou." };
  const priceInCents = Math.max(0, Math.round(PRICE_IN_CENTS * (1 - coupon.percentOff / 100)));
  return { ok: true, coupon, priceInCents };
}

/** Identificador gravado no lugar do ID de pagamento quando o diagnóstico é liberado por cupom. */
export const couponPaymentId = (coupon: Coupon) => `cupom:${coupon.code}`;
