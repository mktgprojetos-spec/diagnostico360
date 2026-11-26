import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isEmailConfigured, sendReportReleasedEmail } from "./email";

const KEYS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const;

describe("email", () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => { for (const k of KEYS) { saved[k] = process.env[k]; delete process.env[k]; } });
  afterEach(() => { for (const k of KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });

  it("does not throw and reports false when SMTP is not configured", async () => {
    expect(isEmailConfigured()).toBe(false);
    await expect(sendReportReleasedEmail({ to: "cliente@example.com", assessmentId: 1, baseUrl: "https://example.com" })).resolves.toBe(false);
  });
});
