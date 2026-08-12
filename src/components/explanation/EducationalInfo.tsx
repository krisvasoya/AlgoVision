import React from "react";
import type { AlgorithmDefinition } from "@/types/algorithm";
import { BookOpen, Lightbulb, ShieldAlert } from "lucide-react";

interface EducationalInfoProps {
  algorithm?: AlgorithmDefinition;
}

export function EducationalInfo({ algorithm }: EducationalInfoProps) {
  if (!algorithm) return null;

  const getUsageNotes = (id: string) => {
    switch (id) {
      case "bubble-sort":
        return {
          how: "Repeatedly steps through the array, compares adjacent elements, and swaps them if they are in the wrong order until no swaps are needed.",
          when: "Ideal for educational purposes, small datasets, or nearly sorted arrays where early termination can achieve O(n) performance.",
        };
      case "selection-sort":
        return {
          how: "Divides the array into sorted and unsorted regions. Repeatedly selects the minimum element from the unsorted region and swaps it to the end of the sorted region.",
          when: "Useful when memory writes are extremely expensive (performs at most n - 1 swaps) or for small arrays.",
        };
      case "insertion-sort":
        return {
          how: "Builds a sorted array one element at a time by picking the next element and shifting larger elements to insert it into its correct position.",
          when: "Highly efficient for small datasets (n <= 20) or nearly sorted data. Commonly used as the base case in hybrid algorithms like Timsort.",
        };
      case "linear-search":
        return {
          how: "Checks every element sequentially from beginning to end until a matching target value is found or the end of the list is reached.",
          when: "Best for unsorted datasets, small lists, or single-use searches where pre-sorting overhead is impractical.",
        };
      case "binary-search":
        return {
          how: "Repeatedly halves the search range on a sorted array by comparing the target with the middle element.",
          when: "Essential for large, pre-sorted datasets where O(log n) logarithmic lookup speed is required.",
        };
      default:
        return {
          how: algorithm.description,
          when: "General purpose Computer Science algorithm.",
        };
    }
  };

  const notes = getUsageNotes(algorithm.id);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
      <div className="flex items-center gap-2 font-semibold text-slate-200 border-b border-slate-800 pb-2">
        <BookOpen className="w-4 h-4 text-indigo-400" />
        <span>Algorithm Insights & Use Cases</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 leading-relaxed">
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> How It Works
          </span>
          <p>{notes.how}</p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Best Use Cases
          </span>
          <p>{notes.when}</p>
        </div>
      </div>
    </div>
  );
}
