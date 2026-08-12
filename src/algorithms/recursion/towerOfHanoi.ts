import type { ExecutionStep, ExecutionTrace, CallFrame, RuntimeState } from "../../types/execution.ts";
import type { HanoiVisualState, HanoiDisk } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const HANOI_SOURCE_CODE = `function hanoi(n, source, target, auxiliary) {
  if (n === 1) {
    moveDisk(1, source, target);
    return;
  }
  hanoi(n - 1, source, auxiliary, target);
  moveDisk(n, source, target);
  hanoi(n - 1, auxiliary, target, source);
}`;

const DISK_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export function generateHanoiTrace(numDisks: number = 3): ExecutionTrace {
  if (typeof numDisks !== "number" || numDisks < 1 || numDisks > 5) {
    throw new Error("Tower of Hanoi supports between 1 and 5 disks.");
  }

  const steps: ExecutionStep[] = [];
  const callStack: CallFrame[] = [];
  let stepCounter = 0;

  // Initialize rods
  const rods: { A: HanoiDisk[]; B: HanoiDisk[]; C: HanoiDisk[] } = {
    A: [],
    B: [],
    C: [],
  };

  for (let d = numDisks; d >= 1; d--) {
    rods.A.push({
      id: `disk-${d}`,
      size: d,
      color: DISK_COLORS[(d - 1) % DISK_COLORS.length],
    });
  }

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    movedDisk?: { size: number; from: "A" | "B" | "C"; to: "A" | "B" | "C" }
  ) {
    const runtimeState: RuntimeState = {
      callStack: JSON.parse(JSON.stringify(callStack)),
    };

    const visualState: HanoiVisualState = {
      type: "hanoi",
      data: {
        rods: JSON.parse(JSON.stringify(rods)),
      },
      runtimeState,
      movedDisk,
    };

    steps.push({
      step: stepCounter++,
      line,
      event,
      variables: JSON.parse(JSON.stringify(variables)),
      state: visualState,
      runtimeState,
      metadata: { description },
    });
  }

  createStep(1, "call", { disks: numDisks }, `Tower of Hanoi initialized with ${numDisks} disks on Rod A.`);

  function solveHanoi(
    n: number,
    source: "A" | "B" | "C",
    target: "A" | "B" | "C",
    auxiliary: "A" | "B" | "C"
  ) {
    const frameId = `hanoi-${n}-${source}-${target}`;
    const frame: CallFrame = {
      id: frameId,
      functionName: "hanoi",
      parameters: { n, source, target, auxiliary },
      locals: { n, source, target, auxiliary },
      currentLine: 1,
    };

    callStack.push(frame);

    // Line 1: Call
    createStep(
      1,
      "call",
      { n, source, target, auxiliary },
      `hanoi(n=${n}, source=${source}, target=${target}, aux=${auxiliary}) called.`
    );

    // Line 2: Base case check
    const isBaseCase = n === 1;
    createStep(
      2,
      "compare",
      { n, isBaseCase },
      `Checking base case (n === 1): ${n} === 1 is ${isBaseCase}.`
    );

    if (isBaseCase) {
      // Move single disk directly
      const diskToMove = rods[source].pop()!;
      rods[target].push(diskToMove);

      createStep(
        3,
        "base_case",
        { disk: diskToMove.size, from: source, to: target },
        `Base case (n=1): Moved disk ${diskToMove.size} directly from Rod ${source} → Rod ${target}.`,
        { size: diskToMove.size, from: source, to: target }
      );

      callStack.pop();
      return;
    }

    // Move n-1 disks from source to auxiliary
    frame.currentLine = 6;
    createStep(
      6,
      "call",
      { step: `Move ${n - 1} disks from ${source} to ${auxiliary}` },
      `Step 1: Recursing to move ${n - 1} top disks from Rod ${source} to Rod ${auxiliary}.`
    );
    solveHanoi(n - 1, source, auxiliary, target);

    // Move nth disk from source to target
    const activeFrame = callStack[callStack.length - 1];
    activeFrame.currentLine = 7;

    const nthDisk = rods[source].pop()!;
    rods[target].push(nthDisk);

    createStep(
      7,
      "update",
      { disk: nthDisk.size, from: source, to: target },
      `Step 2: Moved disk ${nthDisk.size} from Rod ${source} → Rod ${target}.`,
      { size: nthDisk.size, from: source, to: target }
    );

    // Move n-1 disks from auxiliary to target
    activeFrame.currentLine = 8;
    createStep(
      8,
      "call",
      { step: `Move ${n - 1} disks from ${auxiliary} to ${target}` },
      `Step 3: Recursing to move ${n - 1} disks from Rod ${auxiliary} to Rod ${target}.`
    );
    solveHanoi(n - 1, auxiliary, target, source);

    callStack.pop();
  }

  solveHanoi(numDisks, "A", "C", "B");

  // Line 9: Complete
  createStep(
    9,
    "complete",
    { totalMoves: steps.filter((s) => s.state.type === "hanoi" && s.state.movedDisk).length },
    `Tower of Hanoi complete! All ${numDisks} disks successfully transferred from Rod A to Rod C.`
  );

  return {
    algorithmId: "tower-of-hanoi",
    algorithmTitle: "Tower of Hanoi",
    sourceCode: HANOI_SOURCE_CODE,
    initialInput: numDisks,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(2^n)",
    spaceComplexity: "O(n)",
  };
}

export const towerOfHanoiDefinition: AlgorithmDefinition<number, HanoiVisualState> = {
  id: "tower-of-hanoi",
  name: "Tower of Hanoi",
  title: "Tower of Hanoi",
  category: "recursion",
  description: "Classic recursive puzzle of moving disks between 3 rods. Demonstrates divide-and-conquer call stack progression.",
  complexity: { best: "O(2^n)", average: "O(2^n)", worst: "O(2^n)", space: "O(n)" },
  defaultInput: 3,
  sourceCode: HANOI_SOURCE_CODE,
  generateTrace: (input: number) => generateHanoiTrace(typeof input === "number" ? input : 3),
};

ALGORITHM_REGISTRY.register(towerOfHanoiDefinition as unknown as AlgorithmDefinition);
