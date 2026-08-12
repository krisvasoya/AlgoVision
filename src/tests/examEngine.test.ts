import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExamEngine } from "../engine/exam/ExamEngine.ts";

describe("ExamEngine Unit Tests", () => {
  it("should create a valid ExamSession for topic 'sorting'", () => {
    const session = ExamEngine.createSession("sorting", 300);
    assert.equal(session.topic, "sorting");
    assert.equal(session.status, "in-progress");
    assert.equal(session.questions.length > 0, true);
    assert.equal(session.durationSeconds, 300);
  });

  it("should submit answer and record correctness deterministically", () => {
    let session = ExamEngine.createSession("sorting", 300);
    const q1 = session.questions[0];

    session = ExamEngine.submitAnswer(session, q1.id, q1.correctAnswer);
    assert.equal(session.answers[q1.id] !== undefined, true);
    assert.equal(session.answers[q1.id].isCorrect, true);
  });

  it("should evaluate exam result and calculate topic score & weak concepts", () => {
    let session = ExamEngine.createSession("sorting", 300);
    const q1 = session.questions[0];

    session = ExamEngine.submitAnswer(session, q1.id, q1.correctAnswer);
    const result = ExamEngine.evaluateResult(session);

    assert.equal(result.totalQuestions, session.questions.length);
    assert.equal(result.score >= 1, true);
    assert.equal(result.percentage > 0, true);
    assert.equal(result.topicBreakdown.length, 1);
  });
});
