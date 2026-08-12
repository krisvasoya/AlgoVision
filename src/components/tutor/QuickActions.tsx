import React from "react";
import type { TutorRequestType } from "@/engine/tutor/types";
import { HelpCircle, HelpCircle as QuestionIcon, Sparkles, Lightbulb, FastForward, CheckSquare } from "lucide-react";

interface QuickActionsProps {
  onSelectAction: (type: TutorRequestType) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction, disabled = false }) => {
  const actions: { type: TutorRequestType; label: string; icon: any; color: string }[] = [
    { type: "explain_step", label: "Explain Step", icon: Sparkles, color: "text-indigo-400 border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/50" },
    { type: "why", label: "Why?", icon: QuestionIcon, color: "text-blue-400 border-blue-500/30 bg-blue-950/30 hover:bg-blue-900/50" },
    { type: "explain_simple", label: "Explain Simply", icon: HelpCircle, color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/50" },
    { type: "hint", label: "Give Me a Hint", icon: Lightbulb, color: "text-amber-400 border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/50" },
    { type: "what_next", label: "What Happens Next?", icon: FastForward, color: "text-purple-400 border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/50" },
    { type: "quiz", label: "Quiz Me", icon: CheckSquare, color: "text-rose-400 border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/50" },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full scrollbar-none">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.type}
            disabled={disabled}
            onClick={() => onSelectAction(act.type)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium font-sans flex items-center gap-1.5 transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${act.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {act.label}
          </button>
        );
      })}
    </div>
  );
};
