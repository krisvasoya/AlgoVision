import type { ExecutionTrace } from "./execution.ts";
import type { VisualState } from "./visualization.ts";

export type AlgorithmCategory = "sorting" | "searching" | "data-structures" | "recursion";

export interface ComplexityInfo {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface InputFieldSchema {
  id: string;
  label: string;
  type: "array" | "number" | "text";
  defaultValue: any;
  placeholder?: string;
  validation?: {
    integer?: boolean;
    min?: number;
    max?: number;
  };
}

export interface AlgorithmInputSchema {
  fields: InputFieldSchema[];
  showRandomize?: boolean;
  hasTarget?: boolean;
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
  inputSchema?: AlgorithmInputSchema;
  sourceCode: string;
  generateTrace: (input: TInput) => ExecutionTrace;
}
