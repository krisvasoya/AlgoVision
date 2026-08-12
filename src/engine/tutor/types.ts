import type { ExecutionStep, ExecutionEventType, RuntimeState } from "../../types/execution.ts";
import type { VisualState } from "../../types/visualization.ts";
import type { InferredVisualization } from "../visualization/types.ts";

export type TutorRequestType =
  | "explain_step"
  | "why"
  | "explain_simple"
  | "hint"
  | "what_next"
  | "quiz"
  | "check_answer";

export interface TutorContext {
  sourceCode: string;
  algorithmName?: string;
  currentStep: ExecutionStep;
  previousStep?: ExecutionStep;
  nextStep?: ExecutionStep;
  variables: Record<string, unknown>;
  runtimeState?: RuntimeState;
  visualState?: VisualState;
  inference?: InferredVisualization;
  currentLine?: number;
  eventType: ExecutionEventType;
}

export interface TutorRequest {
  type: TutorRequestType;
  studentAnswer?: string;
  hintLevel?: number;
}

export interface TutorResponse {
  type: "explanation" | "hint" | "quiz" | "answer_check";
  response: string;
  confidence?: number;
  referencedStep?: number;
  expectedEvent?: ExecutionEventType;
  quizOptions?: string[];
}

export interface TutorModel {
  generateExplanation(
    context: TutorContext,
    request: TutorRequest
  ): Promise<TutorResponse>;
}
