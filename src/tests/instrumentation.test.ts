import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";
import { InstrumentationBuilder } from "../engine/analysis/InstrumentationBuilder.ts";

describe("Instrumentation Builder Unit Tests", () => {
  it("should generate instrumentable points from program analysis without executing code", () => {
    const code = `function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}`;

    const analysis = CodeAnalyzer.analyze(code);
    const points = InstrumentationBuilder.buildPoints(analysis);

    assert.equal(Array.isArray(points), true);
    assert.equal(points.length > 0, true);

    const callPoint = points.find((p) => p.eventType === "call");
    assert.notEqual(callPoint, undefined);
    assert.equal(callPoint?.line, 1);

    const returnPoint = points.find((p) => p.eventType === "base_case" || p.eventType === "return");
    assert.notEqual(returnPoint, undefined);
  });
});
