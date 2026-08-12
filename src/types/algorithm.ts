import type { ExecutionTrace } from "./execution.ts";
import type { VisualState } from "./visualization.ts";

export type AlgorithmCategory = "sorting" | "searching" | "data-structures" | "recursion";

export interface ComplexityInfo {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface AlgorithmDefinition<TInput = any, TVisualState extends VisualState = VisualState> {
  id: string;
  name: string;
  title: string;
  category: AlgorithmCategory;
  description: string;
  complexity: ComplexityInfo;
  defaultInput: TInput;
  inputType?: "array" | "search" | "number";
  sourceCode: string;
  generateTrace: (input: TInput) => ExecutionTrace;
}
