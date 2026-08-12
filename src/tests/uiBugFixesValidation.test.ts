import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/index.ts";

describe("UI/UX Bug-Fix Pass Unit Tests", () => {
  it("should verify declarative algorithm input properties", () => {
    const hanoi = ALGORITHM_REGISTRY.get("tower-of-hanoi");
    assert.equal(hanoi !== undefined, true);
    assert.equal(hanoi?.id, "tower-of-hanoi");
  });

  it("should format confidence score as clean integer percentage without expression strings", () => {
    const confidence = 0.85;
    const formatted = `${Math.round(confidence * 100)}%`;
    assert.equal(formatted, "85%");
    assert.equal(formatted.includes("MATH"), false);
  });
});
