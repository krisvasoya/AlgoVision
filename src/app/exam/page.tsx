"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sparkles, Clock, CheckCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExamPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center items-center text-center">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
          <Sparkles className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-100 mb-3">Exam Mode Coming Soon</h1>
        <p className="text-slate-400 text-sm max-w-lg mb-8 leading-relaxed">
          Exam Mode will feature timed interactive computer science assessments, step-by-step algorithm tracing challenges, and deterministic performance scoring.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left w-full mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <Clock className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="font-bold text-slate-200 text-sm">Timed Assessments</h4>
            <p className="text-xs text-slate-400 mt-1">Simulate real university CS exams with strict time limits.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="font-bold text-slate-200 text-sm">Step Tracing Tests</h4>
            <p className="text-xs text-slate-400 mt-1">Predict intermediate state arrays and variable values.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <ShieldAlert className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="font-bold text-slate-200 text-sm">Deterministic Grading</h4>
            <p className="text-xs text-slate-400 mt-1">Evaluated 100% against single source of truth execution traces.</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Learning Workspace
        </Link>
      </main>

      <Footer />
    </div>
  );
}
