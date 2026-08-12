import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluatePracticeAnswer } from "../components/practice/evaluatePracticeAnswer.ts";
import { generateBubbleSortTrace } from "../algorithms/sorting/bubbleSort.ts";
import { generateLinearSearchTrace } from "../algorithms/searching/linearSearch.ts";

describe("Phase 6 UI/UX & Practice Mode Unit Tests", () => {
  it("should correctly evaluate Practice Mode answers against trace event types", () => {
    assert.equal(evaluatePracticeAnswer("compare", "compare"), true);
    assert.equal(evaluatePracticeAnswer("swap", "swap_shift"), true);
    assert.equal(evaluatePracticeAnswer("update", "swap_shift"), true);
    assert.equal(evaluatePracticeAnswer("loop", "loop_pointer"), true);
    assert.equal(evaluatePracticeAnswer("assign", "loop_pointer"), true);
    assert.equal(evaluatePracticeAnswer("complete", "complete"), true);

    // Incorrect guesses
    assert.equal(evaluatePracticeAnswer("compare", "swap_shift"), false);
    assert.equal(evaluatePracticeAnswer("swap", "compare"), false);
  });

  it("should evaluate practice questions deterministically using the single ExecutionTrace source of truth", () => {
    const trace = generateBubbleSortTrace([7, 2, 9]);

    // Check step 4 event
    const step4Event = trace.steps[4].event; // compare event in Bubble Sort
    const isStep4CompareCorrect = evaluatePracticeAnswer(step4Event, "compare");
    assert.equal(isStep4CompareCorrect, true);

    const searchTrace = generateLinearSearchTrace({ array: [10, 20], target: 20 });
    const searchStep3Event = searchTrace.steps[3].event; // compare
    assert.equal(evaluatePracticeAnswer(searchStep3Event, "compare"), true);
  });
});
