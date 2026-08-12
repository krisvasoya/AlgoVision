import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateLinkedListTrace } from "../algorithms/data-structures/linkedListOps.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";
import type { LinkedListNodeData } from "../types/visualization.ts";

describe("Singly Linked List Data Structure Unit Tests", () => {
  it("should insert node at beginning (HEAD)", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20],
      action: "insertBeginning",
      value: 99,
    });
    assert.equal(trace.algorithmId, "linked-list-demo");

    const finalStep = trace.steps[trace.steps.length - 1];
    const nodes = (finalStep.state.data as { nodes: LinkedListNodeData[]; headId: string | null }).nodes;
    assert.equal(nodes[0].value, 99);
    assert.equal(nodes[0].nextId, "node-20");
  });

  it("should insert node at end (TAIL)", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20],
      action: "insertEnd",
      value: 99,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    const nodes = (finalStep.state.data as { nodes: LinkedListNodeData[] }).nodes;
    assert.equal(nodes[nodes.length - 1].value, 99);
    assert.equal(nodes[nodes.length - 1].nextId, null);
    assert.equal(nodes[nodes.length - 2].nextId, "node-99");
  });

  it("should perform search success", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20, 30],
      action: "search",
      value: 20,
    });

    const successStep = trace.steps.find((s) => s.event === "visit");
    assert.notEqual(successStep, undefined);
    assert.equal(successStep?.variables["foundIndex"], 1);
  });

  it("should perform search failure when target is absent", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20, 30],
      action: "search",
      value: 999,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["found"], false);
  });

  it("should delete HEAD node (beginning)", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20, 30],
      action: "delete",
      value: 20, // HEAD is 20 in initial order [20, 10]
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    const nodes = (finalStep.state.data as { nodes: LinkedListNodeData[] }).nodes;
    assert.equal(nodes.some((n) => n.value === 20), false);
  });

  it("should delete middle node", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20, 30], // Resulting list nodes: 30 -> 20 -> 10
      action: "delete",
      value: 20,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    const nodes = (finalStep.state.data as { nodes: LinkedListNodeData[] }).nodes;
    assert.equal(nodes.length, 2);
    assert.equal(nodes[0].value, 30);
    assert.equal(nodes[1].value, 10);
    assert.equal(nodes[0].nextId, "node-10");
  });

  it("should delete tail node (end)", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20, 30], // Resulting list nodes: 30 -> 20 -> 10
      action: "delete",
      value: 10,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    const nodes = (finalStep.state.data as { nodes: LinkedListNodeData[] }).nodes;
    assert.equal(nodes.length, 2);
    assert.equal(nodes[nodes.length - 1].value, 20);
    assert.equal(nodes[nodes.length - 1].nextId, null);
  });

  it("should handle empty list operations", () => {
    const trace = generateLinkedListTrace({
      initialValues: [],
      action: "delete",
      value: 10,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
  });

  it("should handle single-node list delete", () => {
    const trace = generateLinkedListTrace({
      initialValues: [50],
      action: "delete",
      value: 50,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    const nodes = (finalStep.state.data as { nodes: LinkedListNodeData[] }).nodes;
    assert.equal(nodes.length, 0);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20, 30],
      action: "insertBeginning",
      value: 99,
    });

    const engine = new ExecutionEngine(trace);
    engine.jumpTo(2);
    const step2Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(2);
    assert.equal(JSON.stringify(engine.currentStep), step2Original);
  });

  it("should guarantee snapshot isolation upon external object mutation", () => {
    const trace = generateLinkedListTrace({
      initialValues: [10, 20],
      action: "insertBeginning",
      value: 99,
    });

    const step1 = trace.steps[1];
    const step1Before = JSON.stringify(step1);

    // Mutate final step
    const finalStep = trace.steps[trace.steps.length - 1];
    (finalStep.state.data as any).nodes.push({ id: "hacked", value: -99 });

    assert.equal(JSON.stringify(step1), step1Before);
  });
});
