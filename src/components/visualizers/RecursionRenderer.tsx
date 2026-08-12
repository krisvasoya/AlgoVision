import React from "react";
import type { RecursionVisualState } from "@/types/visualization";
import { CallStackRenderer } from "./CallStackRenderer";
import { ArrayRenderer } from "./ArrayRenderer";
import { GitBranch, CornerDownRight } from "lucide-react";
import type { CallTreeNode } from "@/types/execution";

interface RecursionRendererProps {
  state: RecursionVisualState;
}

export function RecursionRenderer({ state }: RecursionRendererProps) {
  const { functionName, subVisualState } = state.data;
  const runtimeState = state.runtimeState;
  const callTree = runtimeState.callTree;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full w-full select-none">
      {/* Problem Visualizer / Call Tree (Takes 2 Columns) */}
      <div className="md:col-span-2 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between w-full">
          <span>Recursion Visualizer ({functionName})</span>
          {runtimeState.returnValue !== undefined && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3" /> Final Return Value: {JSON.stringify(runtimeState.returnValue)}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center overflow-auto w-full">
          {subVisualState ? (
            subVisualState.type === "array" ? (
              <ArrayRenderer state={subVisualState} />
            ) : (
              <div className="text-xs text-slate-400">Sub-visualization</div>
            )
          ) : callTree ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-indigo-400" /> Branching Call Tree History
              </div>
              <RenderCallTreeNode node={callTree} />
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic py-8">Active Recursion Trace</div>
          )}
        </div>
      </div>

      {/* Live Call Stack Panel (Takes 1 Column) */}
      <div className="md:col-span-1 h-full">
        <CallStackRenderer runtimeState={runtimeState} />
      </div>
    </div>
  );
}

function RenderCallTreeNode({ node }: { node: CallTreeNode }) {
  const isCompleted = node.status === "completed";
  const isActive = node.status === "active";

  let badgeStyle = "bg-slate-800 border-slate-700 text-slate-300";
  if (isCompleted) badgeStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200";
  if (isActive) badgeStyle = "bg-indigo-950/60 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500/40 font-bold";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`px-3 py-1.5 rounded-md border font-mono text-xs shadow transition-all ${badgeStyle}`}>
        <span>
          {node.name}({Object.values(node.args).join(", ")})
        </span>
        {node.returnValue !== undefined && (
          <span className="ml-2 font-bold text-emerald-400">→ {JSON.stringify(node.returnValue)}</span>
        )}
      </div>

      {node.children.length > 0 && (
        <div className="flex items-start gap-4 pt-2 border-t border-slate-800">
          {node.children.map((child) => (
            <RenderCallTreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
