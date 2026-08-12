"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ALGORITHM_REGISTRY } from "@/algorithms";
import { Layers, ArrowRight, Clock, HardDrive } from "lucide-react";
import Link from "next/link";

export default function AlgorithmsPage() {
  const algorithms = ALGORITHM_REGISTRY.getAll();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Algorithm Catalog</h1>
            <p className="text-sm text-slate-400">
              Interactive CS algorithms registered in the execution registry.
            </p>
          </div>
        </div>

        {/* Algorithm Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {algorithms.map((algo) => (
            <div
              key={algo.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-medium border border-indigo-500/20 capitalize">
                    {algo.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mt-2 mb-1">{algo.title}</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">{algo.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> {algo.complexity.average}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-emerald-400" /> {algo.complexity.space}
                  </span>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Visualize <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
