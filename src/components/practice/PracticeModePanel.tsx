import React, { useState, useEffect } from "react";
import type { ExecutionStep, ExecutionTrace } from "@/types/execution";
import { evaluatePracticeAnswer, PracticeActionType } from "./evaluatePracticeAnswer";
import { HelpCircle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface PracticeModePanelProps {
  currentStepIndex: number;
  trace: ExecutionTrace | null;
  onNextStep: () => void;
}

export function PracticeModePanel({ currentStepIndex, trace, onNextStep }: PracticeModePanelProps) {
  const [selectedAction, setSelectedAction] = useState<PracticeActionType | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Reset selection when current step changes
  useEffect(() => {
    setSelectedAction(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentStepIndex]);

  if (!trace || !trace.steps || trace.steps.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-xs text-slate-400">
        No execution trace loaded for Practice Mode.
      </div>
    );
  }

  const isLastStep = currentStepIndex >= trace.steps.length - 1;
  const nextStep: ExecutionStep | undefined = trace.steps[currentStepIndex + 1];

  const handleSelectOption = (action: PracticeActionType) => {
    if (isAnswered || isLastStep) return;

    setSelectedAction(action);
    const correct = evaluatePracticeAnswer(nextStep?.event, action);
    setIsCorrect(correct);
    setIsAnswered(true);
  };

  const getActionLabel = (action: PracticeActionType): string => {
    switch (action) {
      case "compare":
        return "Compare elements";
      case "swap_shift":
        return "Swap / Shift elements";
      case "loop_pointer":
        return "Move pointer / Loop";
      case "complete":
        return "Complete execution";
    }
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 text-xs space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span>Practice Mode: Predict Next Event</span>
        </div>
        <span className="text-slate-400 font-mono">
          Step {currentStepIndex + 1} of {trace.totalSteps}
        </span>
      </div>

      {isLastStep ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="font-semibold text-slate-200 text-sm">Execution Completed!</p>
          <p className="text-slate-400 text-xs">You reached the final step of the algorithm trace.</p>
        </div>
      ) : (
        <>
          <div>
            <p className="text-slate-300 font-medium mb-3">
              Based on current execution state, what will the algorithm do in the next step?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(["compare", "swap_shift", "loop_pointer", "complete"] as PracticeActionType[]).map(
                (action) => {
                  const isSelected = selectedAction === action;
                  let btnStyle = "bg-slate-950 border-slate-800 hover:border-indigo-500/50 text-slate-200";

                  if (isAnswered && isSelected) {
                    btnStyle = isCorrect
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold"
                      : "bg-rose-500/20 border-rose-500 text-rose-200 font-bold";
                  }

                  return (
                    <button
                      key={action}
                      onClick={() => handleSelectOption(action)}
                      disabled={isAnswered}
                      className={`p-3 rounded-lg border text-left font-medium transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{getActionLabel(action)}</span>
                      {isAnswered && isSelected && (
                        isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Feedback & Next Button */}
          {isAnswered && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              <div>
                <p className="font-bold">
                  {isCorrect ? "Correct!" : "Incorrect!"}
                </p>
                <p className="text-[11px] mt-0.5 opacity-90">
                  {nextStep?.metadata?.description || `Next event is "${nextStep?.event}".`}
                </p>
              </div>

              <button
                onClick={onNextStep}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
