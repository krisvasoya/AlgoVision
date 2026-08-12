import type { ExecutionTrace } from "../../types/execution.ts";

export const mockTrace: ExecutionTrace = {
  algorithmId: "mock-algorithm",
  algorithmTitle: "Mock Execution Trace",
  sourceCode: `function demo() {\n  let x = 10;\n  let y = 20;\n  let sum = x + y;\n  return sum;\n}`,
  initialInput: { x: 10, y: 20 },
  totalSteps: 5,
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  steps: [
    {
      step: 0,
      line: 1,
      event: "call",
      variables: {},
      state: {
        type: "array",
        data: { elements: [{ id: "0", value: 10, index: 0, highlightState: "default" }], length: 1 },
      },
      metadata: { description: "Function demo initialized." },
    },
    {
      step: 1,
      line: 2,
      event: "assign",
      variables: { x: 10 },
      state: {
        type: "array",
        data: { elements: [{ id: "0", value: 10, index: 0, highlightState: "active" }], length: 1 },
      },
      metadata: { description: "Variable x assigned value 10." },
    },
    {
      step: 2,
      line: 3,
      event: "assign",
      variables: { x: 10, y: 20 },
      state: {
        type: "array",
        data: {
          elements: [
            { id: "0", value: 10, index: 0, highlightState: "active" },
            { id: "1", value: 20, index: 1, highlightState: "active" },
          ],
          length: 2,
        },
      },
      metadata: { description: "Variable y assigned value 20." },
    },
    {
      step: 3,
      line: 4,
      event: "update",
      variables: { x: 10, y: 20, sum: 30 },
      state: {
        type: "array",
        data: {
          elements: [
            { id: "0", value: 10, index: 0, highlightState: "compared" },
            { id: "1", value: 20, index: 1, highlightState: "compared" },
            { id: "2", value: 30, index: 2, highlightState: "modified" },
          ],
          length: 3,
        },
      },
      metadata: { description: "Calculated sum = 30." },
    },
    {
      step: 4,
      line: 5,
      event: "complete",
      variables: { x: 10, y: 20, sum: 30, result: 30 },
      state: {
        type: "array",
        data: {
          elements: [
            { id: "0", value: 10, index: 0, highlightState: "sorted" },
            { id: "1", value: 20, index: 1, highlightState: "sorted" },
            { id: "2", value: 30, index: 2, highlightState: "sorted" },
          ],
          length: 3,
        },
      },
      metadata: { description: "Execution complete. Returns 30." },
    },
  ],
};
