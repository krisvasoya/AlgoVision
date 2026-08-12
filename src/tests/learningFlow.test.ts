import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/index.ts";
import { QuestionGenerator } from "../engine/exam/QuestionGenerator.ts";
import { ExamEngine } from "../engine/exam/ExamEngine.ts";
import { ProgressTracker } from "../engine/progress/ProgressTracker.ts";

describe("Learning System End-to-End Flow Unit Tests (Phase 12)", () => {
  it("should complete the full learning loop: Learn -> Practice -> Exam -> Progress", () => {
    // 1. Learn Algorithm
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.equal(algo !== undefined, true);
    const trace = algo!.generateTrace([4, 1, 3]);
    assert.equal(trace.steps.length > 0, true);

    // Record view
    ProgressTracker.recordAlgorithmView("bubble-sort", "Bubble Sort");

    // 2. Practice Prediction
    ProgressTracker.recordPracticeAnswer("bubble-sort", true);

    // 3. Exam Assessment
    let session = ExamEngine.createSession("sorting", 300);
    const q1 = session.questions[0];
    session = ExamEngine.submitAnswer(session, q1.id, q1.correctAnswer);
    const result = ExamEngine.evaluateResult(session);

    // 4. Progress Update
    const prog = ProgressTracker.recordExamResult("sorting", result.percentage, result.weakConcepts);

    assert.equal(prog.algorithmsViewed.includes("bubble-sort"), true);
    assert.equal(prog.examScores.length > 0, true);
  });
});
