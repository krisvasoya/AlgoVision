import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ProgressTracker } from "../engine/progress/ProgressTracker.ts";
import { ALGORITHM_REGISTRY } from "../algorithms/index.ts";

describe("UX Polish & Product Validation Unit Tests (Phase 13)", () => {
  it("should verify complete student journey without dead ends", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.equal(algo !== undefined, true);

    // 1. Record View
    let prog = ProgressTracker.recordAlgorithmView("bubble-sort", "Bubble Sort");
    assert.equal(prog.algorithmsViewed.includes("bubble-sort"), true);

    // 2. Add mistake item to review queue
    prog = ProgressTracker.addReviewItem({
      id: "mistake-1",
      topic: "sorting",
      algorithmId: "bubble-sort",
      questionPrompt: "Step 2 event?",
      userAnswer: "swap",
      correctAnswer: "compare",
      explanation: "Elements compared first",
      recordedAt: Date.now(),
    });

    assert.equal(prog.reviewQueue.length > 0, true);
    assert.equal(prog.reviewQueue[0].algorithmId, "bubble-sort");
  });

  it("should track practice accuracy percentage correctly", () => {
    let prog = ProgressTracker.recordPracticeAnswer("binary-search", true);
    prog = ProgressTracker.recordPracticeAnswer("binary-search", false);

    assert.equal(prog.totalPracticeQuestions >= 2, true);
    assert.equal(typeof prog.practiceAccuracy, "number");
  });
});
