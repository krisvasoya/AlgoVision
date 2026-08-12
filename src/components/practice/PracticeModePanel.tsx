import React, { useState, useEffect } from "react";
import type { ExecutionStep, ExecutionTrace } from "@/types/execution";
import { generatePracticeOptions, evaluatePracticeAnswer } from "./evaluatePracticeAnswer";
import { ProgressTracker } from "@/engine/progress/ProgressTracker";
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Lightbulb } from "lucide-react";

interface PracticeModePanelProps {
  currentStepIndex: number;
  trace: ExecutionTrace | null;
  onNextStep: () => void;
}

export function PracticeModePanel({ currentStepIndex, trace, onNextStep }: PracticeModePanelProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>("");
  const [hintLevel, setHintLevel] = useState<number>(0);

  // Reset selection when current step changes
  useEffect(() => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setExplanation("");
    setHintLevel(0);
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
  const options = generatePracticeOptions(trace, currentStepIndex);

  const handleSelectOption = (optionId: string, optionLabel: string) => {
    if (isAnswered || isLastStep) return;

    setSelectedOptionId(optionId);
    const evalRes = evaluatePracticeAnswer(trace, currentStepIndex, optionId);

    const correct = typeof evalRes === "boolean" ? evalRes : evalRes.isCorrect;
    const expl = typeof evalRes === "boolean" ? (nextStep?.metadata?.description || "Step executed.") : evalRes.explanation;

    setIsCorrect(correct);
    setExplanation(expl);
    setIsAnswered(true);

    // Record practice answer in local progress tracker
    ProgressTracker.recordPracticeAnswer(trace.algorithmId, correct);

    // If incorrect, add to mistake review queue
    if (!correct && nextStep) {
      const correctOpt = options.find((o) => {
        const check = evaluatePracticeAnswer(trace, currentStepIndex, o.id);
        return typeof check === "boolean" ? check : check.isCorrect;
      }) || options[0];

      ProgressTracker.addReviewItem({
        id: `practice-mistake-${Date.now()}`,
        topic: getTopicFromCategory(trace.algorithmId),
        algorithmId: trace.algorithmId,
        questionPrompt: `At Step ${currentStepIndex + 1}, what happens next?`,
        userAnswer: optionLabel,
        correctAnswer: correctOpt.label,
        explanation: expl,
        sourceStep: currentStepIndex,
        recordedAt: Date.now(),
      });
    }
  };

  const getTopicFromCategory = (algoId: string): any => {
    if (algoId.includes("sort")) return "sorting";
    if (algoId.includes("search")) return "searching";
    if (algoId.includes("graph") || algoId.includes("bfs") || algoId.includes("dfs")) return "graphs";
    if (algoId.includes("hanoi") || algoId.includes("factorial") || algoId.includes("fibonacci")) return "recursion";
    return "data-structures";
  };

  const getHintText = (): string => {
    const nextEv = nextStep?.event || "";
    if (hintLevel === 1) {
      return "Focus Attention: Look at the active indices and current variables in the inspector.";
    }
    if (hintLevel === 2) {
      return `Point to State: The current event is operating on variables: ${JSON.stringify(nextStep?.variables || {})}.`;
    }
    if (hintLevel === 3) {
      return `Strong Guidance: The next step involves a "${nextEv}" operation.`;
    }
    return "";
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-300 font-medium">
                Based on current execution state, what will the algorithm do in the next step?
              </p>
              {!isAnswered && (
                <button
                  onClick={() => setHintLevel((prev) => Math.min(prev + 1, 3))}
                  className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono flex items-center gap-1 shrink-0"
                >
                  <Lightbulb className="w-3.5 h-3.5" /> Hint {hintLevel > 0 ? `(${hintLevel}/3)` : ""}
                </button>
              )}
            </div>

            {/* Hint Box */}
            {hintLevel > 0 && !isAnswered && (
              <div className="p-2.5 mb-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-200 font-mono text-[11px]">
                {getHintText()}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = "bg-slate-950 border-slate-800 hover:border-indigo-500/50 text-slate-200";

                if (isAnswered && isSelected) {
                  btnStyle = isCorrect
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold"
                    : "bg-rose-500/20 border-rose-500 text-rose-200 font-bold";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id, opt.label)}
                    disabled={isAnswered}
                    className={`p-3 rounded-lg border text-left font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt.label}</span>
                    {isAnswered && isSelected && (
                      isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )
                    )}
                  </button>
                );
              })}
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
                  {explanation}
                </p>
              </div>

              <button
                onClick={onNextStep}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow shrink-0"
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
