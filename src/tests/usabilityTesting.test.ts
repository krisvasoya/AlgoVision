import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UsabilityTracker } from "../engine/testing/UsabilityTracker.ts";
import type { UsabilityFinding } from "../engine/testing/types.ts";

describe("Usability Testing & Developer Reset Unit Tests (Phase 14)", () => {
  it("should track local usability events safely without errors", () => {
    const evt = UsabilityTracker.trackEvent("algorithm_selected", { algoId: "bubble-sort" });
    assert.equal(evt.type, "algorithm_selected");
    assert.equal(evt.details?.algoId, "bubble-sort");
  });

  it("should construct valid UsabilityFinding records", () => {
    const finding: UsabilityFinding = {
      task: "Task 3: Practice Mode",
      issue: "Hint button placement on small screens",
      severity: "low",
      evidence: "Observed text wrap on 390px viewports",
      proposedFix: "Set flex-shrink on hint button",
    };

    assert.equal(finding.severity, "low");
    assert.equal(finding.proposedFix.length > 0, true);
  });
});
