import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QuestionGenerator } from "../engine/exam/QuestionGenerator.ts";

describe("QuestionGenerator Unit Tests", () => {
  it("should generate deterministic questions for 'sorting' topic", () => {
    const questions = QuestionGenerator.generateQuestionsForTopic("sorting", 3);
    assert.equal(questions.length > 0, true);
    assert.equal(questions[0].topic, "sorting");
    assert.equal(questions[0].options !== undefined, true);
    assert.equal(typeof questions[0].correctAnswer, "string");
  });

  it("should generate deterministic questions for 'recursion' topic directly from trace state", () => {
    const questions = QuestionGenerator.generateQuestionsForTopic("recursion", 2);
    assert.equal(questions.length > 0, true);
    assert.equal(questions[0].topic, "recursion");
    assert.equal(questions[0].explanation.length > 0, true);
  });

  it("should generate deterministic questions for all 5 exam topics", () => {
    const topics: any[] = ["sorting", "searching", "data-structures", "graphs", "recursion"];

    topics.forEach((t) => {
      const q = QuestionGenerator.generateQuestionsForTopic(t, 2);
      assert.equal(q.length > 0, true);
      assert.equal(q[0].topic, t);
    });
  });
});
