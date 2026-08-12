"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-500 flex items-center justify-between">
      <span>AlgoVision &copy; {new Date().getFullYear()} — Computer Science Visual Learning Platform</span>
      <span className="font-mono">Deterministic Execution Architecture</span>
    </footer>
  );
};
