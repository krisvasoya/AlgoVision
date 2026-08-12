import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TutorResponseValidator } from "../engine/tutor/TutorResponseValidator.ts";
import { MockTutorModel } from "../engine/tutor/MockTutorModel.ts";
import { ALGORITHM_REGISTRY } from "../algorithms/index.ts";
import { TutorContextBuilder } from "../engine/tutor/TutorContextBuilder.ts";

describe("TutorResponseValidator & MockTutorModel Unit Tests", () => {
  it("should validate and format structured TutorResponse schema", () => {
    const rawResponse = {
      type: "explanation",
      response: "The algorithm is swapping adjacent elements at index 0 and 1.",
      confidence: 1.0,
      referencedStep: 3,
    };

    const validated = TutorResponseValidator.validate(rawResponse);
    assert.equal(validated.type, "explanation");
    assert.equal(validated.response, rawResponse.response);
    assert.equal(validated.confidence, 1.0);
    assert.equal(validated.referencedStep, 3);
  });

  it("should handle null or invalid AI output safely with fallback response", () => {
    const validated = TutorResponseValidator.validate(null);
    assert.equal(validated.type, "explanation");
    assert.equal(validated.response.includes("unavailable"), true);
    assert.equal(validated.confidence, 0.0);
  });

  it("should generate grounded explanation via MockTutorModel for 'explain_step'", async () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    const trace = algo!.generateTrace([4, 2, 1]);
    const context = TutorContextBuilder.buildContext(trace, 1);

    const model = new MockTutorModel();
    const res = await model.generateExplanation(context, { type: "explain_step" });

    assert.equal(res.type, "explanation");
    assert.equal(res.response.includes("Step 2"), true);
    assert.equal(res.confidence, 1.0);
  });
});
