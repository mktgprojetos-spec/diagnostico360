import { describe, expect, it } from "vitest";
import { allQuestionIds, getQuestionIds, LEGACY_DIAGNOSTIC_VERSION } from "../shared/diagnostic";
import { calculateDiagnostic } from "./diagnostic";

describe("calculateDiagnostic", () => {
  it("returns a reproducible high-confidence result for complete answers", () => {
    const answers = Object.fromEntries(allQuestionIds.map(id => [id, 4]));
    const first = calculateDiagnostic(answers);
    const second = calculateDiagnostic(answers);

    expect(first).toEqual(second);
    expect(first.overallScore).toBe(100);
    expect(first.confidence).toBe("high");
    expect(first.completionPercent).toBe(100);
    expect(first.dimensions.every(dimension => dimension.score === 100)).toBe(true);
  });

  it("keeps the overall result unavailable when too few dimensions have data", () => {
    const legacyQuestionIds = getQuestionIds(LEGACY_DIAGNOSTIC_VERSION);
    const answers = Object.fromEntries(legacyQuestionIds.slice(0, 8).map(id => [id, 3]));
    const result = calculateDiagnostic(answers, LEGACY_DIAGNOSTIC_VERSION);

    expect(result.overallScore).toBeNull();
    expect(result.confidence).toBe("low");
    expect(result.completionPercent).toBe(25);
    expect(result.gaps.length).toBeGreaterThan(0);
  });

  it("uses 24 questions for the current version and keeps 32 in the legacy definition", () => {
    expect(allQuestionIds).toHaveLength(24);
    expect(getQuestionIds(LEGACY_DIAGNOSTIC_VERSION)).toHaveLength(32);
  });

  it("does not convert non-informed answers into score zero", () => {
    const answers = Object.fromEntries(allQuestionIds.map(id => [id, null]));
    const result = calculateDiagnostic(answers);

    expect(result.overallScore).toBeNull();
    expect(result.dimensions.every(dimension => dimension.score === null)).toBe(true);
  });
});
