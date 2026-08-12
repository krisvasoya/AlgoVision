"use client";

import React, { useState } from "react";
import { useExecutionStore } from "@/stores/execution-store";
import { ContextIndicator } from "./ContextIndicator";
import { QuickActions } from "./QuickActions";
import { TutorContextBuilder } from "@/engine/tutor/TutorContextBuilder";
import { ProductionTutorModel } from "@/engine/tutor/ProductionTutorModel";
import { TutorCache } from "@/engine/tutor/TutorCache";
import type { TutorRequestType, TutorResponse } from "@/engine/tutor/types";
import { Bot, Send, User, AlertCircle, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "tutor";
  text: string;
  responseObj?: TutorResponse;
  timestamp: string;
}

export const TutorPanel: React.FC = () => {
  const { trace, currentStepIndex } = useExecutionStore();
  const currentStep = trace?.steps[currentStepIndex];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "tutor",
      text: "Hello! I am your Grounded AI Tutor. Ask me any question or pick a quick action to inspect the current execution step.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const model = new ProductionTutorModel();

  const handleRequest = async (type: TutorRequestType, customText?: string) => {
    if (!trace || !currentStep) return;

    setErrorMsg(null);
    setLoading(true);

    const userText = customText || getActionLabel(type);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Keep bounded conversation memory (max 10 recent messages)
    setMessages((prev) => [...prev.slice(-8), userMsg]);

    try {
      // Check cache first
      let res: TutorResponse | undefined = TutorCache.get(trace.sourceCode, trace.initialInput, currentStepIndex, type);

      if (!res) {
        const context = TutorContextBuilder.buildContext(trace, currentStepIndex);
        res = await model.generateExplanation(context, { type, studentAnswer: customText });
        TutorCache.set(trace.sourceCode, trace.initialInput, currentStepIndex, type, res);
      }

      const tutorMsg: Message = {
        id: `tutor-${Date.now()}`,
        sender: "tutor",
        text: res.response,
        responseObj: res,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev.slice(-9), tutorMsg]);
    } catch {
      setErrorMsg("Tutor temporarily unavailable.");
    } finally {
      setLoading(false);
      setInputQuery("");
    }
  };

  const getActionLabel = (type: TutorRequestType): string => {
    switch (type) {
      case "explain_step": return "Explain this step";
      case "why": return "Why did this happen?";
      case "explain_simple": return "Explain simply";
      case "hint": return "Give me a hint";
      case "what_next": return "What happens next?";
      case "quiz": return "Quiz me";
      case "check_answer": return "Check my answer";
      default: return "Explain step";
    }
  };

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    handleRequest("check_answer", inputQuery);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
      {/* Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Grounded AI Tutor</h3>
        </div>
        {currentStep && <ContextIndicator currentStep={currentStep} algorithmTitle={trace?.algorithmTitle} />}
      </div>

      {/* Quick Actions Bar */}
      <div className="p-2.5 bg-slate-900/80 border-b border-slate-800">
        <QuickActions onSelectAction={(t) => handleRequest(t)} disabled={loading || !currentStep} />
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs">
        {errorMsg && (
          <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-xl p-3 shadow-sm border ${
                msg.sender === "user"
                  ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-100"
                  : "bg-slate-950 border-slate-800 text-slate-200"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Quiz Options if available */}
              {msg.responseObj?.quizOptions && msg.responseObj.quizOptions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {msg.responseObj.quizOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleRequest("check_answer", opt)}
                      className="px-2 py-0.5 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 font-mono text-[11px]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-500 block mt-1 text-right font-mono">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic font-mono p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" /> Grounding explanation in execution trace...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendQuery} className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={currentStep ? "Ask a question about this step..." : "Load an algorithm to ask questions"}
          disabled={!currentStep || loading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!currentStep || loading || !inputQuery.trim()}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
