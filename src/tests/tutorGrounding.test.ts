import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/index.ts";
import { TutorContextBuilder } from "../engine/tutor/TutorContextBuilder.ts";
import { MockTutorModel } from "../engine/tutor/MockTutorModel.ts";
import { TutorCache } from "../engine/tutor/TutorCache.ts";

describe("Tutor Grounding & Non-Blocking Resiliency Unit Tests", () => {
  it("should extract expected next event directly from deterministic trace for 'what_next'", async () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    const trace = algo!.generateTrace([3, 1, 4]);
    const context = TutorContextBuilder.buildContext(trace, 0);
    const expectedNextEvent = trace.steps[1].event;

    const model = new MockTutorModel();
    const res = await model.generateExplanation(context, { type: "what_next" });

    assert.equal(res.expectedEvent, expectedNextEvent);
  });

  it("should provide progressive hints without revealing final answer on hint level 1", async () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    const trace = algo!.generateTrace([3, 1]);
    const context = TutorContextBuilder.buildContext(trace, 1);

    const model = new MockTutorModel();
    const hint1 = await model.generateExplanation(context, { type: "hint", hintLevel: 1 });
    const hint3 = await model.generateExplanation(context, { type: "hint", hintLevel: 3 });

    assert.equal(hint1.response.includes("Hint 1"), true);
    assert.equal(hint3.response.includes("Hint 3"), true);
    assert.notEqual(hint1.response, hint3.response);
  });

  it("should cache tutor responses based on code, input, stepIndex, and requestType", () => {
    const code = "function test() {}";
    const input = { a: 1 };
    const stepIdx = 2;
    const reqType = "explain_step";

    const responseObj = {
      type: "explanation" as const,
      response: "Cached explanation text.",
      confidence: 1.0,
    };

    TutorCache.set(code, input, stepIdx, reqType, responseObj);
    const cached = TutorCache.get(code, input, stepIdx, reqType);

    assert.equal(cached !== undefined, true);
    assert.equal(cached?.response, "Cached explanation text.");
  });

  it("should evaluate student answer against deterministic expected event", async () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    const trace = algo!.generateTrace([5, 2]);
    const context = TutorContextBuilder.buildContext(trace, 0);

    const model = new MockTutorModel();
    const checkResult = await model.generateExplanation(context, {
      type: "check_answer",
      studentAnswer: trace.steps[1].event,
    });

    assert.equal(checkResult.type, "answer_check");
    assert.equal(checkResult.response.includes("Correct"), true);
  });
});
