import { ExecutionStep, ExecutionEventType } from "../../types/execution";
import { VisualState } from "../../types/visualization";

export class TraceBuilder {
  private steps: ExecutionStep[] = [];
  private currentStepNumber: number = 0;

  public addStep(
    line: number,
    event: ExecutionEventType,
    variables: Record<string, unknown>,
    state: VisualState,
    description?: string
  ): ExecutionStep {
    const step: ExecutionStep = {
      step: this.currentStepNumber++,
      line,
      event,
      variables: JSON.parse(JSON.stringify(variables)),
      state: JSON.parse(JSON.stringify(state)),
      metadata: { description },
    };
    this.steps.push(step);
    return step;
  }

  public getSteps(): ExecutionStep[] {
    return [...this.steps];
  }
}
