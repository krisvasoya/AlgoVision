import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ProgressTracker } from "../engine/progress/ProgressTracker.ts";

describe("ProgressTracker Unit Tests", () => {
  it("should return initial student progress structure", () => {
    const prog = ProgressTracker.getProgress();
    assert.equal(Array.isArray(prog.algorithmsViewed), true);
    assert.equal(typeof prog.practiceAccuracy, "number");
    assert.equal(Array.isArray(prog.weakTopics), true);
  });

  it("should record algorithm lesson view in recent activity", () => {
    const prog = ProgressTracker.recordAlgorithmView("binary-search", "Binary Search");
    assert.equal(prog.algorithmsViewed.includes("binary-search"), true);
    assert.equal(prog.recentActivity[0].title.includes("Binary Search"), true);
  });

  it("should record practice answer and update accuracy %", () => {
    const prog = ProgressTracker.recordPracticeAnswer("bubble-sort", true);
    assert.equal(prog.totalPracticeQuestions > 0, true);
    assert.equal(prog.practiceAccuracy >= 0, true);
  });

  it("should record exam results and update weak topics", () => {
    const prog = ProgressTracker.recordExamResult("recursion", 80, ["Recursion base case"]);
    assert.equal(prog.weakTopics.includes("Recursion base case"), true);
    assert.equal(prog.bestScores["recursion"], 80);
  });
});
