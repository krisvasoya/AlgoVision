import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateQueueTrace } from "../algorithms/data-structures/queueOps.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Queue Data Structure Unit Tests", () => {
  it("should generate a valid trace for enqueue, peek, and dequeue operations (FIFO)", () => {
    const trace = generateQueueTrace([10, 20, 30]);
    assert.equal(trace.algorithmId, "queue-demo");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");

    // Queue should have [20, 30] after dequeuing 10 (FIFO)
    const elements = (finalStep.state.data as { elements: Array<{ value: number }> }).elements;
    assert.equal(elements.length, 2);
    assert.equal(elements[0].value, 20);
    assert.equal(elements[1].value, 30);
  });

  it("should handle empty queue operations", () => {
    const trace = generateQueueTrace([]);
    const step0 = trace.steps[0];
    const data = step0.state.data as { elements: any[]; frontIndex: number; rearIndex: number };
    assert.equal(data.elements.length, 0);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateQueueTrace([10, 20, 30]);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(3);
    const step3State = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(3);
    assert.equal(JSON.stringify(engine.currentStep), step3State);
  });
});
