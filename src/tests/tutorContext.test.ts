import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/index.ts";
import { TutorContextBuilder } from "../engine/tutor/TutorContextBuilder.ts";

describe("TutorContextBuilder Unit Tests", () => {
  it("should build grounded TutorContext from Bubble Sort ExecutionTrace step", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.equal(algo !== undefined, true);

    const trace = algo!.generateTrace([5, 2, 8, 1]);
    const context = TutorContextBuilder.buildContext(trace, 2);

    assert.equal(context.sourceCode, trace.sourceCode);
    assert.equal(context.algorithmName, trace.algorithmTitle);
    assert.equal(context.currentStep.step, 2);
    assert.equal(context.currentLine, trace.steps[2].line);
    assert.equal(context.eventType, trace.steps[2].event);
    assert.equal(context.previousStep?.step, 1);
    assert.equal(context.nextStep?.step, 3);
  });

  it("should handle boundary steps gracefully (step 0 has no previous step)", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    const trace = algo!.generateTrace([3, 1]);
    const context = TutorContextBuilder.buildContext(trace, 0);

    assert.equal(context.currentStep.step, 0);
    assert.equal(context.previousStep, undefined);
    assert.equal(context.nextStep !== undefined, true);
  });
});
