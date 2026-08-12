import { create } from "zustand";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";
import { mockTrace } from "../engine/execution/mockTrace.ts";
import type { ExecutionStep, ExecutionTrace } from "../types/execution.ts";

interface ExecutionState {
  engine: ExecutionEngine;
  trace: ExecutionTrace | null;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: ExecutionStep | null;
  isPlaying: boolean;
  speed: number;

  // Actions
  loadTrace: (trace: ExecutionTrace) => void;
  next: () => void;
  previous: () => void;
  first: () => void;
  last: () => void;
  jumpTo: (index: number) => void;
  jumpToStep: (index: number) => void;
  reset: () => void;
  restart: () => void;
  play: () => void;
  pause: () => void;
  setSpeed: (speedMs: number) => void;
}

const defaultEngine = new ExecutionEngine(mockTrace);

export const useExecutionStore = create<ExecutionState>((set, get) => {
  // Subscribe engine updates to Zustand state
  defaultEngine.subscribe((step, isPlaying, speed, currentIndex, totalSteps) => {
    set({
      currentStep: step,
      currentStepIndex: currentIndex,
      totalSteps: totalSteps,
      isPlaying,
      speed,
    });
  });

  return {
    engine: defaultEngine,
    trace: mockTrace,
    currentStepIndex: 0,
    totalSteps: mockTrace.steps.length,
    currentStep: mockTrace.steps[0] || null,
    isPlaying: false,
    speed: 800,

    loadTrace: (trace: ExecutionTrace) => {
      get().engine.loadTrace(trace);
      set({
        trace,
        totalSteps: trace.steps.length,
        currentStepIndex: 0,
        currentStep: trace.steps[0] || null,
      });
    },

    next: () => get().engine.next(),
    previous: () => get().engine.previous(),
    first: () => get().engine.first(),
    last: () => get().engine.last(),
    jumpTo: (index: number) => get().engine.jumpTo(index),
    jumpToStep: (index: number) => get().engine.jumpTo(index),
    reset: () => get().engine.reset(),
    restart: () => get().engine.reset(),
    play: () => get().engine.play(),
    pause: () => get().engine.pause(),
    setSpeed: (speedMs: number) => get().engine.setSpeed(speedMs),
  };
});
