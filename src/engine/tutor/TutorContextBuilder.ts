import type { ExecutionTrace } from "../../types/execution.ts";
import type { TutorContext } from "./types.ts";
import type { InferredVisualization } from "../visualization/types.ts";

export class TutorContextBuilder {
  public static buildContext(
    trace: ExecutionTrace,
    stepIndex: number,
    inference?: InferredVisualization
  ): TutorContext {
    const currentStep = trace.steps[stepIndex] || trace.steps[0];
    const previousStep = stepIndex > 0 ? trace.steps[stepIndex - 1] : undefined;
    const nextStep = stepIndex < trace.steps.length - 1 ? trace.steps[stepIndex + 1] : undefined;

    return {
      sourceCode: trace.sourceCode,
      algorithmName: trace.algorithmTitle,
      currentStep,
      previousStep,
      nextStep,
      variables: currentStep.variables || {},
      runtimeState: currentStep.runtimeState,
      visualState: currentStep.state,
      inference,
      currentLine: currentStep.line,
      eventType: currentStep.event,
    };
  }
}
