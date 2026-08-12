import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ProductionTutorModel } from "../engine/tutor/ProductionTutorModel.ts";
import { ALGORITHM_REGISTRY } from "../algorithms/index.ts";
import { TutorContextBuilder } from "../engine/tutor/TutorContextBuilder.ts";

describe("Production AI Tutor & End-to-End Validation (Phase 11.5) Unit Tests", () => {
  it("should handle provider failures gracefully with non-blocking fallback", async () => {
    // Set invalid provider URL to test failure resiliency
    process.env.NEXT_PUBLIC_AI_PROVIDER = "custom";
    process.env.AI_API_ENDPOINT = "https://invalid-nonexistent-endpoint.domain/api";

    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    const trace = algo!.generateTrace([5, 2]);
    const context = TutorContextBuilder.buildContext(trace, 0);

    const model = new ProductionTutorModel();
    const res = await model.generateExplanation(context, { type: "explain_step" });

    assert.equal(res.type, "explanation");
    assert.equal(res.response, "Tutor temporarily unavailable.");

    // Cleanup env
    delete process.env.NEXT_PUBLIC_AI_PROVIDER;
    delete process.env.AI_API_ENDPOINT;
  });

  it("should refuse misleading student queries asking about absent numbers (Grounding Conflict Protection)", async () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    const trace = algo!.generateTrace([9, 1]); // Variables contain 9 and 1
    const context = TutorContextBuilder.buildContext(trace, 0);

    const model = new ProductionTutorModel();
    const res = await model.generateExplanation(context, {
      type: "check_answer",
      studentAnswer: "Did the algorithm compare 44 and 55?",
    });

    assert.equal(res.response.includes("Values 44, 55 are not present"), true);
  });

  it("should guarantee zero secrets, cookies, or auth tokens are present in prompt context", () => {
    const algo = ALGORITHM_REGISTRY.get("factorial");
    const trace = algo!.generateTrace(4);
    const context = TutorContextBuilder.buildContext(trace, 1);

    const payload = JSON.stringify(context);
    assert.equal(payload.includes("cookie"), false);
    assert.equal(payload.includes("secret"), false);
    assert.equal(payload.includes("token"), false);
    assert.equal(payload.includes("password"), false);
  });

  it("should guarantee 'what_next' event is deterministically extracted from trace.steps[n+1]", async () => {
    const algo = ALGORITHM_REGISTRY.get("linear-search");
    const trace = algo!.generateTrace({ array: [10, 20, 30], target: 20 });
    const context = TutorContextBuilder.buildContext(trace, 1);

    const model = new ProductionTutorModel();
    const res = await model.generateExplanation(context, { type: "what_next" });

    assert.equal(res.expectedEvent, trace.steps[2].event);
  });
});
