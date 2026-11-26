import { describe, expect, it } from "vitest";
import { checkCoupon, couponPaymentId } from "./coupons";

describe("cupons", () => {
  it("CMEC100 zera o valor até 30/11/2026 (horário de Brasília)", () => {
    const result = checkCoupon(" cmec100 ", new Date("2026-11-30T23:59:00-03:00"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.priceInCents).toBe(0);
      expect(couponPaymentId(result.coupon)).toBe("cupom:CMEC100");
    }
  });

  it("CMEC100 expira depois de 30/11/2026", () => {
    expect(checkCoupon("CMEC100", new Date("2026-12-01T00:00:01-03:00"))).toEqual({ ok: false, message: "Este cupom expirou." });
  });

  it("rejeita cupom desconhecido", () => {
    expect(checkCoupon("QUALQUER")).toEqual({ ok: false, message: "Cupom inválido." });
  });
});
