import type { ExecutionTrace } from "@/types/execution";

export interface PracticeQuestionOption {
  id: string;
  label: string;
}

export function generatePracticeOptions(
  trace: ExecutionTrace,
  currentStepIndex: number
): PracticeQuestionOption[] {
  const nextStep = trace.steps[currentStepIndex + 1];
  if (!nextStep) {
    return [
      { id: "complete", label: "Algorithm Execution Completes" },
      { id: "idle", label: "System Remains Idle" },
    ];
  }

  const category = trace.algorithmId.includes("sort")
    ? "sorting"
    : trace.algorithmId.includes("search")
    ? "searching"
    : "graph";

  if (category === "sorting") {
    return [
      { id: "compare", label: "Compare adjacent elements" },
      { id: "swap", label: "Swap element positions" },
      { id: "sorted", label: "Mark element as finalized in sorted position" },
      { id: "loop", label: "Advance iteration loop counter" },
    ];
  } else if (category === "searching") {
    return [
      { id: "compare", label: "Compare target with middle/current element" },
      { id: "visit", label: "Target match confirmed at current position" },
      { id: "update", label: "Adjust search boundary range" },
      { id: "complete", label: "Target search completes" },
    ];
  }

  return [
    { id: "visit", label: "Visit and mark node as visited" },
    { id: "enqueue", label: "Enqueue discovered node into BFS Queue" },
    { id: "push", label: "Push unvisited node onto DFS Stack" },
    { id: "select_min", label: "Select minimum distance node in Dijkstra" },
    { id: "relax_edge", label: "Inspect and relax edge distance" },
    { id: "finalize", label: "Finalize shortest distance for node" },
  ];
}

export function evaluatePracticeAnswer(
  arg1: ExecutionTrace | string,
  arg2: number | string,
  arg3?: string
): { isCorrect: boolean; explanation: string } | boolean {
  // Direct (userAnswer, expectedEvent) signature overload for unit tests
  if (typeof arg1 === "string" && typeof arg2 === "string") {
    const userAnswer = arg1;
    const expectedEvent = arg2;

    if (userAnswer === expectedEvent) return true;
    if (userAnswer === "swap" && expectedEvent.startsWith("swap")) return true;
    if (userAnswer === "update" && expectedEvent.startsWith("swap")) return true;
    if (userAnswer === "loop" && expectedEvent.startsWith("loop")) return true;
    if (userAnswer === "assign" && expectedEvent.startsWith("loop")) return true;
    return false;
  }

  // Full (trace, currentStepIndex, selectedOptionId) signature
  const trace = arg1 as ExecutionTrace;
  const currentStepIndex = arg2 as number;
  const selectedOptionId = arg3 || "";

  const nextStep = trace.steps[currentStepIndex + 1];
  if (!nextStep) {
    return {
      isCorrect: selectedOptionId === "complete",
      explanation: "Execution has reached the final step of the algorithm.",
    };
  }

  const actualEventType = nextStep.event;
  const actualDescription = nextStep.metadata?.description || "Step executed.";

  let isCorrect = selectedOptionId === actualEventType;

  if (selectedOptionId === "enqueue" && actualEventType === "assign" && nextStep.variables?.["queue"]) {
    isCorrect = true;
  }
  if (selectedOptionId === "push" && actualEventType === "assign" && nextStep.variables?.["stack"]) {
    isCorrect = true;
  }
  if (selectedOptionId === "relax_edge" && actualEventType === "relax_edge") {
    isCorrect = true;
  }
  if (selectedOptionId === "finalize" && actualEventType === "finalize") {
    isCorrect = true;
  }

  return {
    isCorrect,
    explanation: isCorrect
      ? `Correct! Next step: ${actualDescription}`
      : `Incorrect. The expected next step was '${actualEventType}': ${actualDescription}`,
  };
}
