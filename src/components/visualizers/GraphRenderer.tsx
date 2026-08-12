import React from "react";
import type { GraphVisualState } from "@/types/visualization";
import { calculateGraphLayout } from "@/engine/geometry/graphLayout";
import { Layers, Table, Sparkles, CheckCircle2 } from "lucide-react";

interface GraphRendererProps {
  state: GraphVisualState;
}

export function GraphRenderer({ state }: GraphRendererProps) {
  const { nodes, edges } = state.data;
  const activeNodeId = state.activeNodeId;
  const activeEdgeId = state.activeEdgeId;
  const visitedNodeIds = state.visitedNodeIds || [];
  const queuedNodeIds = state.queuedNodeIds;
  const stackedNodeIds = state.stackedNodeIds;
  const distanceTable = state.distanceTable;
  const candidateNodeIds = state.candidateNodeIds || [];
  const selectedNodeId = state.selectedNodeId;
  const shortestPathTreeEdgeIds = state.shortestPathTreeEdgeIds || [];
  const finalPathEdgeIds = state.finalPathEdgeIds || [];

  const layout = calculateGraphLayout(nodes, edges, 600, 280);

  return (
    <div className="flex flex-col items-center justify-between h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden select-none min-w-0 min-h-0">
      {/* Top Header & Accessibility Bar */}
      <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-between w-full shrink-0">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Graph Canvas
        </span>
        {state.startNodeId && (
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              START: {state.startNodeId}
            </span>
            {state.targetNodeId && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                TARGET: {state.targetNodeId}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main SVG Graph Canvas (Bounded Responsively) */}
      <div className="w-full flex-1 relative min-w-0 min-h-0 overflow-hidden flex items-center justify-center">
        {nodes.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-8">Empty Graph</div>
        ) : (
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full drop-shadow-md"
          >
            <defs>
              <marker
                id="arrowhead-default"
                markerWidth="10"
                markerHeight="7"
                refX="22"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="22"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
              <marker
                id="arrowhead-tree"
                markerWidth="10"
                markerHeight="7"
                refX="22"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
              </marker>
              <marker
                id="arrowhead-final"
                markerWidth="10"
                markerHeight="7"
                refX="22"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
            </defs>

            {/* Graph Edges */}
            {layout.edges.map((edge) => {
              const isActive = edge.id === activeEdgeId;
              const isTreeEdge = shortestPathTreeEdgeIds.includes(edge.id);
              const isFinalPath = finalPathEdgeIds.includes(edge.id);

              let strokeColor = "#475569";
              let strokeWidth = "2";
              let strokeDasharray: string | undefined = undefined;
              let markerId = "arrowhead-default";

              if (isTreeEdge) {
                strokeColor = "#6366f1";
                strokeWidth = "2.5";
                strokeDasharray = "4 4";
                markerId = "arrowhead-tree";
              }
              if (isActive) {
                strokeColor = "#f59e0b";
                strokeWidth = "3.5";
                strokeDasharray = undefined;
                markerId = "arrowhead-active";
              }
              if (isFinalPath) {
                strokeColor = "#10b981";
                strokeWidth = "4";
                strokeDasharray = undefined;
                markerId = "arrowhead-final";
              }

              return (
                <g key={edge.id}>
                  <line
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    markerEnd={edge.isDirected ? `url(#${markerId})` : undefined}
                  />
                  {edge.weight !== undefined && (
                    <text
                      x={(edge.x1 + edge.x2) / 2}
                      y={(edge.y1 + edge.y2) / 2 - 6}
                      fill={isFinalPath ? "#34d399" : isActive ? "#fbbf24" : "#94a3b8"}
                      fontSize="11"
                      fontWeight={isFinalPath || isActive ? "bold" : "normal"}
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.weight}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Graph Nodes */}
            {layout.nodes.map((node) => {
              const isActive = node.id === activeNodeId;
              const isSelectedMin = node.id === selectedNodeId;
              const isVisited = visitedNodeIds.includes(node.id);
              const isQueued = queuedNodeIds?.includes(node.id);
              const isStacked = stackedNodeIds?.includes(node.id);
              const isCandidate = candidateNodeIds.includes(node.id);
              const isStart = node.id === state.startNodeId;
              const isTarget = node.id === state.targetNodeId;

              let fillColor = "#1e293b";
              let strokeColor = "#475569";
              let textColor = "#e2e8f0";
              let badgeText: string | null = null;

              if (isQueued) {
                fillColor = "rgba(99, 102, 241, 0.2)";
                strokeColor = "#818cf8";
                badgeText = "Q";
              }
              if (isStacked) {
                fillColor = "rgba(245, 158, 11, 0.2)";
                strokeColor = "#fbbf24";
                badgeText = "S";
              }
              if (isCandidate) {
                badgeText = "CAN";
              }
              if (isVisited) {
                fillColor = "rgba(16, 185, 129, 0.25)";
                strokeColor = "#10b981";
                textColor = "#34d399";
                badgeText = "VIS";
              }
              if (isSelectedMin) {
                fillColor = "rgba(245, 158, 11, 0.35)";
                strokeColor = "#f59e0b";
                textColor = "#fbbf24";
                badgeText = "MIN";
              }
              if (isActive) {
                fillColor = "rgba(99, 102, 241, 0.35)";
                strokeColor = "#6366f1";
                textColor = "#a5b4fc";
                badgeText = "CURR";
              }

              return (
                <g key={node.id} className="transition-all duration-200 cursor-pointer">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={fillColor}
                    stroke={isStart || isTarget ? "#f59e0b" : strokeColor}
                    strokeWidth={isActive || isSelectedMin || isStart || isTarget ? "3" : "2"}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>
                  {badgeText && (
                    <text
                      x={node.x + 15}
                      y={node.y - 12}
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {badgeText}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Semantic Algorithm State Panel */}
      <div className="w-full mt-2 pt-2 border-t border-slate-800 space-y-2 shrink-0">
        {queuedNodeIds && (
          <div className="p-2 bg-slate-950 border border-indigo-500/30 rounded-lg flex items-center gap-3 text-xs">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5 shrink-0">
              <Layers className="w-3.5 h-3.5" /> BFS Queue:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto font-mono text-slate-200">
              {queuedNodeIds.length === 0 ? (
                <span className="text-slate-500 italic text-[11px]">[ Empty Queue ]</span>
              ) : (
                queuedNodeIds.map((nodeId, idx) => (
                  <span
                    key={`q-${nodeId}-${idx}`}
                    className={`px-2 py-0.5 rounded border font-bold text-xs ${
                      idx === 0
                        ? "bg-indigo-500/30 border-indigo-400 text-indigo-100"
                        : "bg-slate-900 border-slate-800 text-slate-300"
                    }`}
                  >
                    {idx === 0 ? `FRONT: ${nodeId}` : nodeId}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {stackedNodeIds && (
          <div className="p-2 bg-slate-950 border border-amber-500/30 rounded-lg flex items-center gap-3 text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 shrink-0">
              <Layers className="w-3.5 h-3.5" /> DFS Stack:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto font-mono text-slate-200">
              {stackedNodeIds.length === 0 ? (
                <span className="text-slate-500 italic text-[11px]">[ Empty Stack ]</span>
              ) : (
                stackedNodeIds.map((nodeId, idx) => {
                  const isTop = idx === stackedNodeIds.length - 1;
                  return (
                    <span
                      key={`s-${nodeId}-${idx}`}
                      className={`px-2 py-0.5 rounded border font-bold text-xs ${
                        isTop
                          ? "bg-amber-500/30 border-amber-400 text-amber-100"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      {isTop ? `TOP: ${nodeId}` : nodeId}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        )}

        {distanceTable && (
          <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5" /> Dijkstra Live Distance Table
              </span>
              {selectedNodeId && (
                <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  MIN: Node {selectedNodeId}
                </span>
              )}
            </div>
            <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
              {distanceTable.map((entry) => {
                const isSelected = entry.node === selectedNodeId;
                const isFinal = entry.isFinalized;

                let cardStyle = "bg-slate-900 border-slate-800 text-slate-300";
                if (isFinal) cardStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-bold";
                if (isSelected) cardStyle = "bg-amber-500/25 border-amber-500/60 text-amber-200 font-bold ring-1 ring-amber-500/50";

                return (
                  <div key={`dt-${entry.node}`} className={`p-1 rounded border text-center ${cardStyle}`}>
                    <div className="font-bold text-slate-100 flex items-center justify-center gap-1">
                      <span>Node {entry.node}</span>
                      {isFinal && <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />}
                    </div>
                    <div className="text-amber-400 font-bold text-[11px] mt-0.5">dist: {entry.distance}</div>
                    <div className="text-[10px] text-slate-400">parent: {entry.parent ? entry.parent : "null"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
