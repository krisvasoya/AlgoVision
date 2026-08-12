import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/registry.ts";
import type { AlgorithmDefinition } from "../types/algorithm.ts";
import "../algorithms/sorting/bubbleSort.ts";
import "../algorithms/sorting/selectionSort.ts";
import "../algorithms/sorting/insertionSort.ts";
import "../algorithms/searching/linearSearch.ts";
import "../algorithms/searching/binarySearch.ts";
import "../algorithms/data-structures/stackOps.ts";
import "../algorithms/data-structures/queueOps.ts";
import "../algorithms/data-structures/linkedListOps.ts";
import "../algorithms/data-structures/treeOps.ts";
import "../algorithms/data-structures/graphOps.ts";
import "../algorithms/graph/bfs.ts";
import "../algorithms/graph/dfs.ts";
import "../algorithms/graph/dijkstra.ts";
import "../algorithms/recursion/factorial.ts";
import "../algorithms/recursion/fibonacci.ts";
import "../algorithms/recursion/recursiveBinarySearch.ts";
import "../algorithms/recursion/towerOfHanoi.ts";

describe("Cross-Algorithm Architectural Verification Suite", () => {
  const expectedAlgoIds = [
    "bubble-sort",
    "selection-sort",
    "insertion-sort",
    "linear-search",
    "binary-search",
    "stack-demo",
    "queue-demo",
    "linked-list-demo",
    "tree-demo",
    "graph-demo",
    "bfs",
    "dfs",
    "dijkstra",
    "factorial",
    "fibonacci",
    "recursive-binary-search",
    "tower-of-hanoi",
  ];

  it("should have all 17 algorithms & data structures registered in ALGORITHM_REGISTRY", () => {
    const registered = ALGORITHM_REGISTRY.getAll();
    assert.equal(registered.length, 17);

    expectedAlgoIds.forEach((id) => {
      assert.equal(ALGORITHM_REGISTRY.has(id), true, `Algorithm/Data Structure ID ${id} missing from registry.`);
    });
  });

  function assertAlgorithmContract(algo: AlgorithmDefinition) {
    assert.equal(typeof algo.id, "string");
    assert.equal(typeof algo.name, "string");
    assert.equal(typeof algo.title, "string");
    assert.equal(typeof algo.category, "string");
    assert.equal(typeof algo.description, "string");
    assert.equal(typeof algo.sourceCode, "string");

    assert.equal(typeof algo.complexity.best, "string");
    assert.equal(typeof algo.complexity.average, "string");
    assert.equal(typeof algo.complexity.worst, "string");
    assert.equal(typeof algo.complexity.space, "string");

    assert.equal(typeof algo.generateTrace, "function");

    const trace = algo.generateTrace(algo.defaultInput as any);
    assert.equal(typeof trace.algorithmId, "string");
    assert.equal(typeof trace.algorithmTitle, "string");
    assert.equal(typeof trace.sourceCode, "string");
    assert.equal(Array.isArray(trace.steps), true);
    assert.equal(trace.steps.length > 0, true);
    assert.equal(trace.totalSteps, trace.steps.length);
  }

  it("should validate that every registered item satisfies AlgorithmDefinition contract", () => {
    const algorithms = ALGORITHM_REGISTRY.getAll();
    algorithms.forEach((algo) => {
      assertAlgorithmContract(algo);
    });
  });

  it("should guarantee deterministic trace generation across all 17 items", () => {
    const algorithms = ALGORITHM_REGISTRY.getAll();
    algorithms.forEach((algo) => {
      const trace1 = algo.generateTrace(algo.defaultInput as any);
      const trace2 = algo.generateTrace(algo.defaultInput as any);

      assert.equal(
        JSON.stringify(trace1),
        JSON.stringify(trace2),
        `Deterministic replay failed for ${algo.id}`
      );
    });
  });
});
