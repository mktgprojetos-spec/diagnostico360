import { afterEach, describe, expect, it } from "vitest";
import { isConfiguredAdminEmail } from "./db";

describe("ADMIN_EMAILS", () => {
  afterEach(() => { delete process.env.ADMIN_EMAILS; });

  it("recognizes configured admin e-mails, ignoring case and spaces", () => {
    process.env.ADMIN_EMAILS = " mkt.gprojetos@gmail.com , outra@exemplo.com";
    expect(isConfiguredAdminEmail("MKT.GProjetos@gmail.com")).toBe(true);
    expect(isConfiguredAdminEmail("outra@exemplo.com")).toBe(true);
    expect(isConfiguredAdminEmail("cliente@exemplo.com")).toBe(false);
    expect(isConfiguredAdminEmail(null)).toBe(false);
  });

  it("grants nothing when the secret is not set", () => {
    expect(isConfiguredAdminEmail("mkt.gprojetos@gmail.com")).toBe(false);
  });
});
