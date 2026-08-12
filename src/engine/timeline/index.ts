import { ExecutionTrace } from "../../types/execution";

export interface TimelineState {
  currentStepIndex: number;
  totalSteps: number;
  progressPercentage: number;
}

export function calculateTimelineState(trace: ExecutionTrace | null, currentIndex: number): TimelineState {
  if (!trace || trace.steps.length === 0) {
    return { currentStepIndex: 0, totalSteps: 0, progressPercentage: 0 };
  }
  const total = trace.steps.length;
  const clamped = Math.max(0, Math.min(total - 1, currentIndex));
  const progress = total > 1 ? (clamped / (total - 1)) * 100 : 100;
  return {
    currentStepIndex: clamped,
    totalSteps: total,
    progressPercentage: Math.round(progress),
  };
}
