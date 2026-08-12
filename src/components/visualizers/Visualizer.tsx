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
import { Play } from "lucide-react";

interface VisualizerProps {
  state?: VisualState;
}

export function Visualizer({ state }: VisualizerProps) {
  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <Play className="w-6 h-6 mb-2 text-indigo-400 opacity-80" />
        <p className="font-bold text-xs text-slate-300">No execution yet</p>
        <p className="text-[11px] mt-1 text-slate-500 max-w-xs">Run the program to inspect runtime state & inferred visualizer.</p>
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
        <div className="flex items-center justify-center h-full text-xs text-slate-400 font-mono">
          Unsupported Visual State Type
        </div>
      );
  }
}
