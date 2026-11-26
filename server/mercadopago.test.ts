import crypto from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const paymentGet = vi.fn();
const preferenceCreate = vi.fn();
const markPaid = vi.fn();

vi.mock("mercadopago", async importOriginal => {
  const actual = await importOriginal<typeof import("mercadopago")>();
  return {
    ...actual,
    MercadoPagoConfig: class { constructor(public opts: unknown) {} },
    Payment: class { get = paymentGet; },
    Preference: class { create = preferenceCreate; },
  };
});
vi.mock("./db", () => ({
  markAssessmentPaid: (...args: unknown[]) => markPaid(...args),
  getAssessmentById: vi.fn(async () => ({ id: 7, companyId: 1 })),
  getCompanyById: vi.fn(async () => ({ name: "Empresa Teste" })),
}));
vi.mock("./email", () => ({ appUrl: () => "https://exemplo.com", sendPaymentReceivedOwnerEmail: vi.fn() }));

const { handleMercadoPagoWebhook, confirmAssessmentCheckout, createAssessmentCheckout } = await import("./mercadopago");

function fakeRes() {
  const res = { statusCode: 200, body: undefined as unknown, status(code: number) { res.statusCode = code; return res; }, json(b: unknown) { res.body = b; return res; }, send(b: unknown) { res.body = b; return res; } };
  return res;
}
function fakeReq(query: Record<string, string>, headers: Record<string, string> = {}, body: unknown = {}) {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return { query, body, get: (name: string) => lower[name.toLowerCase()] } as never;
}
function sign(dataId: string, requestId: string, secret: string) {
  const ts = String(Math.floor(Date.now() / 1000));
  const v1 = crypto.createHmac("sha256", secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

describe("Mercado Pago", () => {
  beforeEach(() => {
    paymentGet.mockReset(); preferenceCreate.mockReset(); markPaid.mockReset();
    process.env.MERCADOPAGO_ACCESS_TOKEN = "TEST-token";
    process.env.MERCADOPAGO_WEBHOOK_SECRET = "segredo";
  });

  it("creates a preference with up to 12 installments and the assessment as reference", async () => {
    preferenceCreate.mockResolvedValue({ id: "pref_1", init_point: "https://mp/checkout" });
    const req = { get: (h: string) => (h === "origin" ? "https://site.com" : undefined) } as never;
    const result = await createAssessmentCheckout(req, { id: 3, email: "a@b.com" }, 7);
    expect(result).toEqual({ id: "pref_1", url: "https://mp/checkout" });
    const body = preferenceCreate.mock.calls[0][0].body;
    expect(body.payment_methods.installments).toBe(12);
    expect(body.payment_methods.excluded_payment_types).toEqual([{ id: "ticket" }, { id: "atm" }]);
    expect(body.external_reference).toBe("7");
    expect(body.items[0].unit_price).toBe(497);
    expect(body.notification_url).toBe("https://site.com/api/mercadopago/webhook");
  });

  it("marks the assessment as paid when an approved payment notification arrives", async () => {
    paymentGet.mockResolvedValue({ id: 123, status: "approved", external_reference: "7" });
    markPaid.mockResolvedValue(true);
    const res = fakeRes();
    await handleMercadoPagoWebhook(fakeReq({ "data.id": "123", type: "payment" }, { "x-signature": sign("123", "req-1", "segredo"), "x-request-id": "req-1" }), res as never);
    expect(res.statusCode).toBe(200);
    expect(markPaid).toHaveBeenCalledWith(7, "123");
  });

  it("rejects a notification with an invalid signature", async () => {
    const res = fakeRes();
    await handleMercadoPagoWebhook(fakeReq({ "data.id": "123", type: "payment" }, { "x-signature": sign("123", "req-1", "outro"), "x-request-id": "req-1" }), res as never);
    expect(res.statusCode).toBe(401);
    expect(paymentGet).not.toHaveBeenCalled();
  });

  it("does not release pending (e.g. Pix not yet paid) payments", async () => {
    paymentGet.mockResolvedValue({ id: 124, status: "pending", external_reference: "7" });
    const res = fakeRes();
    await handleMercadoPagoWebhook(fakeReq({ "data.id": "124", type: "payment" }, { "x-signature": sign("124", "req-2", "segredo"), "x-request-id": "req-2" }), res as never);
    expect(res.statusCode).toBe(200);
    expect(markPaid).not.toHaveBeenCalled();
  });

  it("ignores non-payment topics", async () => {
    const res = fakeRes();
    await handleMercadoPagoWebhook(fakeReq({ id: "55", topic: "merchant_order" }), res as never);
    expect(res.statusCode).toBe(200);
    expect(paymentGet).not.toHaveBeenCalled();
  });

  it("does not confirm a payment that belongs to another assessment", async () => {
    paymentGet.mockResolvedValue({ id: 125, status: "approved", external_reference: "99" });
    await expect(confirmAssessmentCheckout("125", 7)).resolves.toBe(false);
    expect(markPaid).not.toHaveBeenCalled();
  });

  it("answers 200 to notifications about payments that do not exist (panel simulation)", async () => {
    paymentGet.mockRejectedValue({ status: 404, message: "Payment not found" });
    const res = fakeRes();
    await handleMercadoPagoWebhook(fakeReq({ "data.id": "123456", type: "payment" }, { "x-signature": sign("123456", "req-9", "segredo"), "x-request-id": "req-9" }), res as never);
    expect(res.statusCode).toBe(200);
    expect(markPaid).not.toHaveBeenCalled();
  });
});
