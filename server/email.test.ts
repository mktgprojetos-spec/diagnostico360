import { afterEach, describe, expect, it } from "vitest";
import { isEmailConfigured, sendReportReleasedEmail } from "./email";

describe("email", () => {
  afterEach(() => { delete process.env.SMTP_HOST; delete process.env.SMTP_USER; delete process.env.SMTP_PASS; });

  it("does not throw and reports false when SMTP is not configured", async () => {
    expect(isEmailConfigured()).toBe(false);
    await expect(sendReportReleasedEmail({ to: "cliente@example.com", assessmentId: 1, baseUrl: "https://example.com" })).resolves.toBe(false);
  });
});
