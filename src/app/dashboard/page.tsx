"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProgressTracker } from "@/engine/progress/ProgressTracker";
import type { StudentProgress } from "@/engine/progress/types";
import { ALGORITHM_REGISTRY } from "@/algorithms";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Target, ShieldAlert, ArrowRight, History, RotateCcw } from "lucide-react";

export default function DashboardPage() {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(ProgressTracker.getProgress());
  }, []);

  if (!mounted || !progress) return null;

  const currentAlgo = ALGORITHM_REGISTRY.get("bubble-sort");

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-indigo-400" /> Student Learning Dashboard
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Track your algorithm visual lessons, practice accuracy, exam competency scores, and review mistakes.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition shadow flex items-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-4 h-4" /> Continue Learning
          </Link>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Lessons</span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-2">
              {progress.completedLessons.length} / 17
            </div>
            <span className="text-[11px] text-slate-500 mt-1">17 total registered algorithms</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Accuracy</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2">
              {progress.practiceAccuracy}%
            </div>
            <span className="text-[11px] text-slate-500 mt-1">{progress.correctPracticeQuestions} / {progress.totalPracticeQuestions} correct</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exams Taken</span>
            <div className="text-2xl font-extrabold text-purple-400 mt-2">
              {progress.examScores.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Timed competency assessments</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weak Topics</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-2">
              {progress.weakTopics.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Actionable concepts to study</span>
          </div>
        </div>

        {/* Review Mistakes Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-rose-400" /> Review Mistakes Queue ({progress.reviewQueue.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Spaced Review Flow</span>
          </div>

          {progress.reviewQueue.length > 0 ? (
            <div className="space-y-3">
              {progress.reviewQueue.map((item) => (
                <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                        {item.topic}
                      </span>
                      <span className="text-slate-400">Algorithm: {item.algorithmId}</span>
                    </div>
                    <p className="font-bold text-slate-200">{item.questionPrompt}</p>
                    <div className="font-mono text-[11px] text-slate-400 space-x-3">
                      <span>Your Answer: <span className="text-rose-400 line-through">{item.userAnswer}</span></span>
                      <span>Correct: <span className="text-emerald-400 font-bold">{item.correctAnswer}</span></span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">{item.explanation}</p>
                  </div>

                  <Link
                    href={`/?algo=${item.algorithmId}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shrink-0 flex items-center gap-1 shadow"
                  >
                    Revisit Lesson <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-xs text-emerald-400">
              You&apos;re clean for now! Zero recorded mistakes. Keep practicing!
            </div>
          )}
        </div>

        {/* Continue Learning & Weak Topics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Continue Learning (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" /> Continue Learning
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Featured Lesson</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">{currentAlgo?.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentAlgo?.description}</p>
            </div>

            <Link
              href="/"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow"
            >
              Open Interactive Visual Lesson <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Weak Concepts List (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col gap-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Actionable Weak Concepts
            </h3>
            {progress.weakTopics.length > 0 ? (
              <ul className="text-xs font-mono text-slate-300 space-y-2">
                {progress.weakTopics.map((wt, idx) => (
                  <li key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span>{wt}</span>
                    <Link href="/exam" className="text-[11px] font-bold text-indigo-400 hover:underline">
                      Practice Exam
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-400 font-mono">No weak concepts detected. Great performance!</p>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col gap-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-400" /> Recent Learning Activity
          </h3>
          <div className="space-y-2">
            {progress.recentActivity.map((act, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200">{act.title}</span>
                <span className="text-[10px] text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {act.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
