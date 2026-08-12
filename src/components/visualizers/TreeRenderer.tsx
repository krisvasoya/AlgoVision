import React from "react";
import type { TreeVisualState } from "@/types/visualization";
import { calculateTreeLayout } from "@/engine/geometry/treeLayout";

interface TreeRendererProps {
  state: TreeVisualState;
}

export function TreeRenderer({ state }: TreeRendererProps) {
  const { nodes, rootId } = state.data;
  const activeId = state.activeId;
  const comparedIds = state.comparedIds || [];
  const visitedIds = state.visitedIds || [];
  const pathIds = state.pathIds || [];

  const layout = calculateTreeLayout(nodes, rootId, 560, 65);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden select-none">
      <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
        Binary Search Tree (SVG Canvas)
      </div>

      <div className="w-full flex-1 flex items-center justify-center overflow-auto">
        {nodes.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-8">Empty Binary Search Tree</div>
        ) : (
          <svg
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="max-w-full h-auto drop-shadow-md"
          >
            {/* Edge Branch Lines */}
            {layout.edges.map((edge) => {
              const isPath =
                pathIds.includes(edge.id.split("-")[1]) && pathIds.includes(edge.id.split("-")[2]);

              return (
                <line
                  key={edge.id}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={isPath ? "#6366f1" : "#475569"}
                  strokeWidth={isPath ? "3" : "2"}
                  strokeDasharray={isPath ? undefined : undefined}
                />
              );
            })}

            {/* Tree Nodes */}
            {layout.nodes.map((node) => {
              const isActive = node.id === activeId;
              const isCompared = comparedIds.includes(node.id);
              const isVisited = visitedIds.includes(node.id);

              let fillColor = "#1e293b"; // slate-800
              let strokeColor = "#475569"; // slate-600
              let textColor = "#e2e8f0";

              if (isVisited) {
                fillColor = "rgba(16, 185, 129, 0.25)";
                strokeColor = "#10b981"; // emerald-500
                textColor = "#34d399";
              }
              if (isCompared) {
                fillColor = "rgba(245, 158, 11, 0.25)";
                strokeColor = "#f59e0b"; // amber-500
                textColor = "#fbbf24";
              }
              if (isActive) {
                fillColor = "rgba(99, 102, 241, 0.35)";
                strokeColor = "#6366f1"; // indigo-500
                textColor = "#a5b4fc";
              }

              return (
                <g key={node.id} className="transition-all duration-200 cursor-pointer">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isActive || isCompared ? "3" : "2"}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.value}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
