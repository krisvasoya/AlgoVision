"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Award, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DevResetPanel } from "./DevResetPanel";

export const Header: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Learn", href: "/", icon: BookOpen },
    { name: "Exams", href: "/exam", icon: Award },
    { name: "Playground", href: "/playground", icon: Terminal },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
          AV
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          AlgoVision
        </span>
        <span className="text-xs px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-medium">
          CS Platform
        </span>
      </Link>

      <nav className="flex items-center gap-1 font-medium text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-sans font-semibold",
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <DevResetPanel />
    </header>
  );
};
