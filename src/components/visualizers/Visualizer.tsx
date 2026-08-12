import React from "react";
import type { VisualState } from "@/types/visualization";
import { ArrayRenderer } from "./ArrayRenderer";
import { StackRenderer } from "./StackRenderer";
import { QueueRenderer } from "./QueueRenderer";
import { LinkedListRenderer } from "./LinkedListRenderer";
import { TreeRenderer } from "./TreeRenderer";
import { GraphRenderer } from "./GraphRenderer";
import { HanoiRenderer } from "./HanoiRenderer";
import { RecursionRenderer } from "./RecursionRenderer";
import { Layers } from "lucide-react";

interface VisualizerProps {
  state?: VisualState;
}

export function Visualizer({ state }: VisualizerProps) {
  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
        <Layers className="w-10 h-10 mb-3 text-slate-700 animate-pulse" />
        <p className="font-semibold text-sm">No Visual Execution State</p>
        <p className="text-xs mt-1 text-slate-600">Select an algorithm to begin execution.</p>
      </div>
    );
  }

  switch (state.type) {
    case "array":
      return <ArrayRenderer state={state} />;
    case "stack":
      return <StackRenderer state={state} />;
    case "queue":
      return <QueueRenderer state={state} />;
    case "linked-list":
      return <LinkedListRenderer state={state} />;
    case "tree":
      return <TreeRenderer state={state} />;
    case "graph":
      return <GraphRenderer state={state} />;
    case "hanoi":
      return <HanoiRenderer state={state} />;
    case "recursion":
      return <RecursionRenderer state={state} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-xs text-slate-400">
          Unsupported Visual State Type
        </div>
      );
  }
}
