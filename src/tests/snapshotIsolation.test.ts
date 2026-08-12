import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/registry.ts";
import { ArrayTraceBuilder } from "../engine/tracing/ArrayTraceBuilder.ts";
import type { ArrayVisualState, ArrayElement } from "../types/visualization.ts";
import "../algorithms/sorting/bubbleSort.ts"; // Ensure bubbleSort is registered

describe("True Snapshot Isolation & Immutability Integration Tests", () => {
  it("should prevent working array mutations from altering historical ExecutionSteps", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.notEqual(algo, undefined);

    const workingArray = [9, 3, 7, 1];
    const trace = algo!.generateTrace(workingArray);

    // Save historical step references
    const step0 = trace.steps[0];
    const step3 = trace.steps[3];

    // Stringify historical snapshots before mutation
    const step0BeforeMutation = JSON.stringify(step0);
    const step3BeforeMutation = JSON.stringify(step3);

    // Aggressively mutate input array after trace generation
    workingArray[0] = -9999;
    workingArray[1] = 8888;
    workingArray.push(7777);

    // Stringify historical snapshots after mutation
    const step0AfterMutation = JSON.stringify(step0);
    const step3AfterMutation = JSON.stringify(step3);

    // Historical steps must remain 100% untouched
    assert.equal(step0BeforeMutation, step0AfterMutation);
    assert.equal(step3BeforeMutation, step3AfterMutation);

    const step0Elements = (step0.state.data as { elements: ArrayElement[] }).elements;
    assert.equal(step0Elements[0].value, 9);
    assert.equal(step0Elements[1].value, 3);
  });

  it("should prevent variable object mutations from corrupting prior steps", () => {
    const builder = new ArrayTraceBuilder<number>([5, 2]);

    const mutableVars = { i: 0, j: 0, list: [5, 2] };
    const step0 = builder.addStep({
      line: 1,
      event: "assign",
      variables: mutableVars,
      description: "Step 0",
    });

    // Mutate local variables object after adding step
    mutableVars.i = 99;
    mutableVars.list[0] = 999;

    const step1 = builder.addStep({
      line: 2,
      event: "update",
      variables: mutableVars,
      description: "Step 1",
    });

    assert.equal(step0.variables["i"], 0);
    assert.equal((step0.variables["list"] as number[])[0], 5);

    assert.equal(step1.variables["i"], 99);
    assert.equal((step1.variables["list"] as number[])[0], 999);
  });

  it("should guarantee mutating one ExecutionStep cannot mutate another ExecutionStep", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.notEqual(algo, undefined);
    const trace = algo!.generateTrace([4, 2, 8]);

    const step1 = trace.steps[1];
    const step2 = trace.steps[2];

    const step2Original = JSON.stringify(step2);

    // Mutate step1 properties
    (step1.state.data as { elements: ArrayElement[] }).elements[0].value = -1;
    step1.variables["mutatedKey"] = "corrupted";

    // Verify step2 was completely unaffected by step1 mutation
    const step2Current = JSON.stringify(step2);
    assert.equal(step2Original, step2Current);
  });
});
