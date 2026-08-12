import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ArrayTraceBuilder } from "../engine/tracing/ArrayTraceBuilder.ts";
import { ALGORITHM_REGISTRY, AlgorithmRegistry } from "../algorithms/registry.ts";
import { bubbleSortDefinition } from "../algorithms/sorting/bubbleSort.ts";

describe("Architecture Hardening Unit Tests", () => {
  it("should enforce immutable deep-copied historical snapshots in ArrayTraceBuilder", () => {
    const mutableArr = [10, 20, 30];
    const builder = new ArrayTraceBuilder<number>(mutableArr);

    const step1 = builder.addStep({
      line: 1,
      event: "access",
      variables: { arr: [...mutableArr] },
      compared: [0, 1],
      description: "Step 1 snapshot",
    });

    // Mutate the source array and variables after step 1 creation
    mutableArr[0] = 999;
    builder.setArray(mutableArr);

    const step2 = builder.addStep({
      line: 2,
      event: "update",
      variables: { arr: [...mutableArr] },
      description: "Step 2 snapshot",
    });

    // Verify historical Step 1 snapshot remained untouched by mutation
    const step1Elements = (step1.state.data as { elements: Array<{ value: number }> }).elements;
    const step2Elements = (step2.state.data as { elements: Array<{ value: number }> }).elements;

    assert.equal(step1Elements[0].value, 10);
    assert.equal(step2Elements[0].value, 999);
  });

  it("should validate ALGORITHM_REGISTRY discovery and lookup", () => {
    const customRegistry = new AlgorithmRegistry();
    customRegistry.register(bubbleSortDefinition);

    assert.equal(customRegistry.has("bubble-sort"), true);
    assert.equal(customRegistry.has("unknown-algo"), false);

    const fetched = customRegistry.get("bubble-sort");
    assert.notEqual(fetched, undefined);
    assert.equal(fetched?.id, "bubble-sort");
    assert.equal(fetched?.name, "Bubble Sort");
    assert.equal(fetched?.category, "sorting");

    const sortingAlgos = customRegistry.getByCategory("sorting");
    assert.equal(sortingAlgos.length, 1);
  });

  it("should conform to standard AlgorithmDefinition contract", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.notEqual(algo, undefined);

    if (algo) {
      assert.equal(typeof algo.id, "string");
      assert.equal(typeof algo.name, "string");
      assert.equal(typeof algo.title, "string");
      assert.equal(typeof algo.category, "string");
      assert.equal(typeof algo.sourceCode, "string");

      assert.equal(typeof algo.complexity.best, "string");
      assert.equal(typeof algo.complexity.average, "string");
      assert.equal(typeof algo.complexity.worst, "string");
      assert.equal(typeof algo.complexity.space, "string");

      assert.equal(Array.isArray(algo.defaultInput), true);
      assert.equal(typeof algo.generateTrace, "function");
    }
  });

  it("should guarantee identical inputs produce 100% identical traces", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.notEqual(algo, undefined);

    if (algo) {
      const trace1 = algo.generateTrace([5, 3, 8, 1]);
      const trace2 = algo.generateTrace([5, 3, 8, 1]);

      assert.equal(JSON.stringify(trace1), JSON.stringify(trace2));
    }
  });
});
