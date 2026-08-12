import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import { TraceStorage } from "./TraceStorage.ts";

export type EngineListener = (
  step: ExecutionStep | null,
  isPlaying: boolean,
  speed: number,
  currentIndex: number,
  totalSteps: number
) => void;

export class ExecutionEngine {
  private storage: TraceStorage = new TraceStorage();
  private currentStepIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeedMs: number = 800; // default 800ms per step
  private timerId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<EngineListener> = new Set();

  constructor(trace?: ExecutionTrace) {
    if (trace) {
      this.loadTrace(trace);
    }
  }

  public loadTrace(trace: ExecutionTrace): void {
    this.pause();
    this.storage.setTrace(trace);
    this.currentStepIndex = 0;
    this.notify();
  }

  public getTrace(): ExecutionTrace | null {
    return this.storage.getTrace();
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getTotalSteps(): number {
    return this.storage.getTotalSteps();
  }

  public getCurrentStep(): ExecutionStep | null {
    return this.storage.getStep(this.currentStepIndex);
  }

  // Convenient property accessors matching Phase 2 requirements
  public get currentStep(): ExecutionStep | null {
    return this.getCurrentStep();
  }

  public get totalSteps(): number {
    return this.getTotalSteps();
  }

  public isEnginePlaying(): boolean {
    return this.isPlaying;
  }

  public getSpeed(): number {
    return this.playbackSpeedMs;
  }

  public setSpeed(speedMs: number): void {
    this.playbackSpeedMs = Math.max(50, Math.min(3000, speedMs));
    if (this.isPlaying) {
      // Re-initialize timer interval with updated speed
      this.pause();
      this.play();
    } else {
      this.notify();
    }
  }

  public next(): boolean {
    const total = this.getTotalSteps();
    if (total === 0) return false;

    if (this.currentStepIndex < total - 1) {
      this.currentStepIndex++;
      this.notify();
      return true;
    } else {
      this.pause();
      return false;
    }
  }

  public previous(): boolean {
    if (this.getTotalSteps() === 0) return false;

    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.notify();
      return true;
    }
    return false;
  }

  public jumpTo(index: number): boolean {
    const total = this.getTotalSteps();
    if (total === 0) return false;

    const clamped = this.storage.clampIndex(index);
    this.currentStepIndex = clamped;
    this.notify();
    return true;
  }

  // Alias jumpToStep for backward compatibility
  public jumpToStep(index: number): boolean {
    return this.jumpTo(index);
  }

  public first(): void {
    this.jumpTo(0);
  }

  public last(): void {
    const total = this.getTotalSteps();
    if (total > 0) {
      this.jumpTo(total - 1);
    }
  }

  public reset(): void {
    this.pause();
    this.currentStepIndex = 0;
    this.notify();
  }

  public restart(): void {
    this.reset();
  }

  public play(): void {
    const total = this.getTotalSteps();
    if (total === 0 || this.isPlaying) return;

    if (this.currentStepIndex >= total - 1) {
      this.currentStepIndex = 0;
    }
    this.isPlaying = true;
    this.notify();

    this.timerId = setInterval(() => {
      const moved = this.next();
      if (!moved) {
        this.pause();
      }
    }, this.playbackSpeedMs);
  }

  public pause(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.isPlaying) {
      this.isPlaying = false;
      this.notify();
    }
  }

  public subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    // Emit current state immediately upon subscription
    listener(
      this.getCurrentStep(),
      this.isPlaying,
      this.playbackSpeedMs,
      this.currentStepIndex,
      this.getTotalSteps()
    );
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const step = this.getCurrentStep();
    const total = this.getTotalSteps();
    for (const listener of this.listeners) {
      listener(step, this.isPlaying, this.playbackSpeedMs, this.currentStepIndex, total);
    }
  }
}
