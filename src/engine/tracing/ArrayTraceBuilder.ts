import type { ExecutionStep, ExecutionTrace, ExecutionEventType } from "../../types/execution.ts";
import type { ArrayVisualState, ArrayElement, ElementHighlightState } from "../../types/visualization.ts";

export interface AddArrayStepOptions<T extends number | string = number | string> {
  line: number;
  event: ExecutionEventType;
  variables: Record<string, unknown>;
  compared?: number[];
  swapped?: number[];
  modified?: number[];
  visited?: number[];
  pointers?: Record<number, string[]>;
  searchRange?: [number, number];
  description?: string;
  complexityHint?: string;
}

export class ArrayTraceBuilder<T extends number | string = number | string> {
  private currentArray: T[];
  private steps: ExecutionStep[] = [];
  private sortedIndices: Set<number> = new Set();
  private stepCounter: number = 0;

  constructor(initialArray: T[]) {
    this.currentArray = [...initialArray];
  }

  public getArray(): T[] {
    return [...this.currentArray];
  }

  public setArray(newArray: T[]): void {
    this.currentArray = [...newArray];
  }

  public markSorted(indexOrIndices: number | number[]): void {
    if (Array.isArray(indexOrIndices)) {
      indexOrIndices.forEach((idx) => this.sortedIndices.add(idx));
    } else {
      this.sortedIndices.add(indexOrIndices);
    }
  }

  public clearSorted(): void {
    this.sortedIndices.clear();
  }

  public addStep(options: AddArrayStepOptions<T>): ExecutionStep {
    const {
      line,
      event,
      variables,
      compared = [],
      swapped = [],
      modified = [],
      visited = [],
      pointers = {},
      searchRange,
      description,
      complexityHint,
    } = options;

    // Deep-copy array elements & create immutable snapshot
    const elements: ArrayElement[] = this.currentArray.map((val, idx) => {
      let highlightState: ElementHighlightState = "default";
      if (this.sortedIndices.has(idx)) {
        highlightState = "sorted";
      } else if (swapped.includes(idx)) {
        highlightState = "swapped";
      } else if (compared.includes(idx)) {
        highlightState = "compared";
      } else if (modified.includes(idx)) {
        highlightState = "modified";
      } else if (visited.includes(idx)) {
        highlightState = "visited";
      }

      // Deep-copy pointer labels array for index
      const itemPointers = pointers[idx] ? [...pointers[idx]] : [];

      return {
        id: `el-${idx}`,
        value: val,
        index: idx,
        highlightState,
        pointers: itemPointers,
      };
    });

    const visualState: ArrayVisualState = {
      type: "array",
      data: {
        elements,
        length: this.currentArray.length,
      },
      active: Object.keys(pointers).map(Number),
      compared: [...compared],
      modified: [...swapped, ...modified],
      sorted: Array.from(this.sortedIndices),
      searchRange: searchRange ? [...searchRange] : undefined,
    };

    // Deep-copy variables map
    const clonedVariables: Record<string, unknown> = JSON.parse(JSON.stringify(variables));

    const step: ExecutionStep = {
      step: this.stepCounter++,
      line,
      event,
      variables: clonedVariables,
      state: visualState,
      metadata: {
        description: description || "",
        complexityHint,
      },
    };

    this.steps.push(step);
    return step;
  }

  public toTrace(
    algorithmId: string,
    algorithmTitle: string,
    sourceCode: string,
    initialInput: unknown,
    timeComplexity: string,
    spaceComplexity: string
  ): ExecutionTrace {
    return {
      algorithmId,
      algorithmTitle,
      sourceCode,
      initialInput,
      steps: [...this.steps],
      totalSteps: this.steps.length,
      timeComplexity,
      spaceComplexity,
    };
  }
}
