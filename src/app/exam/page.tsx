"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExamEngine } from "@/engine/exam/ExamEngine";
import { ProgressTracker } from "@/engine/progress/ProgressTracker";
import type { ExamSession, ExamTopic, ExamResult } from "@/engine/exam/types";
import { Clock, ShieldAlert, CheckCircle2, XCircle, Award, BarChart3, RotateCcw, ArrowRight } from "lucide-react";

const TOPICS: { id: ExamTopic; title: string; desc: string; icon: string }[] = [
  { id: "sorting", title: "Sorting Algorithms", desc: "Bubble, Selection, and Insertion Sort", icon: "📊" },
  { id: "searching", title: "Searching Algorithms", desc: "Linear and Binary Search", icon: "🔍" },
  { id: "data-structures", title: "Data Structures", desc: "Stack, Queue, Linked List, BST", icon: "📦" },
  { id: "graphs", title: "Graph Algorithms", desc: "BFS, DFS, and Dijkstra", icon: "🌐" },
  { id: "recursion", title: "Recursion & Call Stack", desc: "Factorial, Fibonacci, Hanoi", icon: "🔄" },
];

export default function ExamPage() {
  const [selectedTopic, setSelectedTopic] = useState<ExamTopic>("sorting");
  const [session, setSession] = useState<ExamSession | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Timer Effect
  useEffect(() => {
    if (!session || session.status !== "in-progress") return;

    const timer = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.status !== "in-progress") return prev;

        const nextRemaining = prev.remainingSeconds - 1;
        if (nextRemaining <= 0) {
          const expiredSession: ExamSession = { ...prev, remainingSeconds: 0, status: "expired" };
          const res = ExamEngine.evaluateResult(expiredSession);
          setResult(res);
          ProgressTracker.recordExamResult(prev.topic, res.percentage, res.weakConcepts);
          return expiredSession;
        }

        return { ...prev, remainingSeconds: nextRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.status]);

  // Keyboard Shortcuts (1, 2, 3, 4 for option selection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!session || session.status !== "in-progress") return;
      const currentQ = session.questions[session.currentQuestionIndex];
      if (!currentQ || !currentQ.options) return;

      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQ.options[idx]) {
          handleSelectAnswer(currentQ.id, currentQ.options[idx]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session]);

  const handleStartExam = (topic: ExamTopic) => {
    const newSession = ExamEngine.createSession(topic, 300); // 5 min duration
    setSession(newSession);
    setResult(null);
    setSelectedOption(null);
  };

  const handleSelectAnswer = (qId: string, option: string) => {
    if (!session || session.status !== "in-progress") return;
    setSelectedOption(option);
    const updated = ExamEngine.submitAnswer(session, qId, option);
    setSession(updated);
  };

  const handleNextQuestion = () => {
    if (!session) return;
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession({ ...session, currentQuestionIndex: session.currentQuestionIndex + 1 });
      setSelectedOption(null);
    } else {
      // Submit Exam
      const submitted: ExamSession = { ...session, status: "submitted" };
      setSession(submitted);
      const res = ExamEngine.evaluateResult(submitted);
      setResult(res);
      ProgressTracker.recordExamResult(session.topic, res.percentage, res.weakConcepts);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Topic Selection View (Not Started) */}
        {(!session || session.status === "not-started") && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-400" /> Exam Mode Competency Assessments
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  Timed assessments with anti-assistance mode. AI Tutor & solution previews are disabled during the test.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg flex items-center gap-1.5 shrink-0">
                <ShieldAlert className="w-4 h-4" /> Timed & Grounded
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition shadow flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="text-3xl mb-2">{topic.icon}</div>
                    <h3 className="font-bold text-sm text-slate-200">{topic.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{topic.desc}</p>
                  </div>
                  <button
                    onClick={() => handleStartExam(topic.id)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow"
                  >
                    Start Exam <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Exam View (In Progress) */}
        {session && session.status === "in-progress" && (
          <div className="flex flex-col gap-4">
            {/* Top Bar: Title, Question Counter, Visible Timer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{session.title}</span>
                <span className="text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
                  Question {session.currentQuestionIndex + 1} of {session.questions.length}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 font-mono font-bold text-sm px-3 py-1 rounded-lg border ${
                  session.remainingSeconds <= 60
                    ? "bg-rose-950 text-rose-300 border-rose-500/40 animate-pulse"
                    : "bg-slate-950 text-indigo-300 border-indigo-500/30"
                }`}
              >
                <Clock className="w-4 h-4" /> {formatTimer(session.remainingSeconds)}
              </div>
            </div>

            {/* Question Card */}
            {session.questions[session.currentQuestionIndex] && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {session.questions[session.currentQuestionIndex].type.replace("_", " ")}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Difficulty: {session.questions[session.currentQuestionIndex].difficulty}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100">
                    {session.questions[session.currentQuestionIndex].prompt}
                  </h2>
                </div>

                {/* Multiple Choice Options */}
                {session.questions[session.currentQuestionIndex].options && (
                  <div className="grid grid-cols-1 gap-3">
                    {session.questions[session.currentQuestionIndex].options.map((option, idx) => {
                      const qId = session.questions[session.currentQuestionIndex].id;
                      const isSelected = session.answers[qId]?.userAnswer === option || selectedOption === option;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(qId, option)}
                          className={`p-3.5 rounded-xl border text-left text-xs font-mono transition flex items-center gap-3 ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow"
                              : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                            {idx + 1}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Next / Submit Control */}
                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow flex items-center gap-2"
                  >
                    {session.currentQuestionIndex === session.questions.length - 1 ? "Submit Exam" : "Next Question"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exam Results Summary View */}
        {result && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl font-extrabold text-indigo-400">
                  {result.percentage}%
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Exam Results Summary</h2>
                  <p className="text-xs text-slate-400">
                    Score: {result.score} / {result.totalQuestions} correct ({result.timeSpentSeconds}s elapsed)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSession(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition shadow flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Take Another Exam
              </button>
            </div>

            {/* Topic Breakdown & Weak Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col gap-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Topic Performance
                </h3>
                {result.topicBreakdown.map((tb, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span>{tb.topic.toUpperCase()}</span>
                      <span>{tb.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-indigo-500 h-full transition-all" style={{ width: `${tb.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col gap-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Weak Concepts Identified
                </h3>
                {result.weakConcepts.length > 0 ? (
                  <ul className="text-xs font-mono text-slate-300 list-disc list-inside space-y-1">
                    {result.weakConcepts.map((wc, idx) => (
                      <li key={idx}>{wc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-400 font-mono">None! Perfect score achieved across all topics.</p>
                )}
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow flex flex-col gap-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">Question Review</h3>
              <div className="space-y-4">
                {result.questions.map((q, idx) => {
                  const ans = result.answers[idx];
                  const isCorrect = ans?.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border font-sans text-xs space-y-2 ${
                        isCorrect
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
                          : "bg-rose-950/20 border-rose-500/30 text-rose-100"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                          Q{idx + 1}: {q.prompt}
                        </span>
                        <span className="font-mono text-[11px] uppercase">{isCorrect ? "Correct" : "Incorrect"}</span>
                      </div>

                      <div className="font-mono text-[11px] space-y-0.5 text-slate-300 pl-6">
                        <div>Your Answer: {ans?.userAnswer || "Unanswered"}</div>
                        <div>Correct Answer: {q.correctAnswer}</div>
                        <div className="text-slate-400 mt-1 italic">{q.explanation}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
