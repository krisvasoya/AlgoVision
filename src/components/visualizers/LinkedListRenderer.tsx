import React from "react";
import type { LinkedListVisualState } from "@/types/visualization";
import { ArrowRight } from "lucide-react";

interface LinkedListRendererProps {
  state: LinkedListVisualState;
}

export function LinkedListRenderer({ state }: LinkedListRendererProps) {
  const { nodes, headId } = state.data;
  const activeId = state.activeId;
  const visitedIds = state.visitedIds || [];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden select-none">
      <div className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
        Singly Linked List Nodes & Pointer Chains
      </div>

      <div className="flex items-center gap-2 max-w-full overflow-x-auto p-4 min-h-28">
        {nodes.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-4 px-8">Empty Linked List (HEAD → null)</div>
        ) : (
          nodes.map((node, idx) => {
            const isHead = node.id === headId;
            const isActive = node.id === activeId;
            const isVisited = visitedIds.includes(node.id);

            let borderStyle = "border-slate-700 bg-slate-950 text-slate-200";
            if (isHead) borderStyle = "border-indigo-500 bg-indigo-950/40 text-indigo-200";
            if (isVisited) borderStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold";
            if (isActive) borderStyle = "border-amber-500 bg-amber-950/40 text-amber-200 font-bold scale-105";

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div className="flex flex-col items-center gap-1">
                  {isHead && (
                    <span className="text-[10px] font-mono font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      HEAD
                    </span>
                  )}
                  <div className={`flex rounded-lg border shadow overflow-hidden transition-all duration-200 ${borderStyle}`}>
                    <div className="px-3.5 py-2.5 font-mono font-bold text-sm border-r border-slate-800">
                      {node.value}
                    </div>
                    <div className="px-2.5 py-2.5 font-mono text-[10px] text-slate-500 flex items-center bg-slate-900/80">
                      {node.nextId ? "next" : "null"}
                    </div>
                  </div>
                </div>

                {/* Arrow Vector Link */}
                <div className="flex items-center text-indigo-400 px-1">
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </React.Fragment>
            );
          })
        )}

        {nodes.length > 0 && (
          <div className="font-mono text-xs text-slate-500 px-2 py-1 bg-slate-950 border border-slate-800 rounded">
            null
          </div>
        )}
      </div>
    </div>
  );
}
