import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateTreeTrace } from "../algorithms/data-structures/treeOps.ts";
import { calculateTreeLayout } from "../engine/geometry/treeLayout.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";
import type { TreeNodeData } from "../types/visualization.ts";

describe("Binary Search Tree Data Structure Unit Tests", () => {
  it("should perform BST search success", () => {
    const trace = generateTreeTrace({
      initialValues: [8, 4, 12, 2, 6],
      action: "search",
      value: 6,
    });
    assert.equal(trace.algorithmId, "tree-demo");

    const successStep = trace.steps.find((s) => s.variables["action"] === "searchSuccess");
    assert.notEqual(successStep, undefined);
    assert.equal(successStep?.variables["target"], 6);
  });

  it("should perform BST search failure when target is absent", () => {
    const trace = generateTreeTrace({
      initialValues: [8, 4, 12, 2, 6],
      action: "search",
      value: 99,
    });

    const failureStep = trace.steps.find((s) => s.variables["action"] === "searchFailure");
    assert.notEqual(failureStep, undefined);
    assert.equal(failureStep?.variables["found"], false);
  });

  it("should execute Preorder Traversal (Root -> Left -> Right)", () => {
    const trace = generateTreeTrace({
      initialValues: [8, 4, 12],
      action: "preorder",
    });

    const visits = trace.steps
      .filter((s) => s.variables["action"] === "preorderVisit")
      .map((s) => s.variables["visitedVal"]);

    assert.deepEqual(visits, [8, 4, 12]);
  });

  it("should execute Postorder Traversal (Left -> Right -> Root)", () => {
    const trace = generateTreeTrace({
      initialValues: [8, 4, 12],
      action: "postorder",
    });

    const visits = trace.steps
      .filter((s) => s.variables["action"] === "postorderVisit")
      .map((s) => s.variables["visitedVal"]);

    assert.deepEqual(visits, [4, 12, 8]);
  });

  it("should handle duplicate value insertion gracefully", () => {
    const trace = generateTreeTrace({
      initialValues: [8, 4],
      action: "insert",
      value: 8, // Duplicate root value
    });

    const duplicateStep = trace.steps.find((s) => s.variables["action"] === "insertDuplicate");
    assert.notEqual(duplicateStep, undefined);
  });

  it("should handle empty tree operations", () => {
    const trace = generateTreeTrace({
      initialValues: [],
      action: "search",
      value: 10,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateTreeTrace({
      initialValues: [8, 4, 12],
      action: "preorder",
    });

    const engine = new ExecutionEngine(trace);
    engine.jumpTo(2);
    const step2Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(2);
    assert.equal(JSON.stringify(engine.currentStep), step2Original);
  });

  it("should calculate correct SVG tree geometry layout coordinates", () => {
    const trace = generateTreeTrace([8, 4, 12]);
    const finalState = trace.steps[trace.steps.length - 1].state;
    const data = finalState.data as { nodes: any[]; rootId: string | null };

    const layout = calculateTreeLayout(data.nodes, data.rootId, 600, 70);
    assert.equal(layout.nodes.length, 3);

    const rootPos = layout.nodes.find((n) => n.value === 8);
    assert.equal(rootPos?.x, 300);
    assert.equal(rootPos?.y, 40);
  });
});
