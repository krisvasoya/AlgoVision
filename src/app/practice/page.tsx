"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GraduationCap } from "lucide-react";

export default function PracticePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Interactive Practice & Exam Prep</h1>
            <p className="text-sm text-slate-400">
              Test your understanding of algorithm step traces and time complexity analysis.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
          <p className="text-sm font-medium">Practice modules will unlock in future phases.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
