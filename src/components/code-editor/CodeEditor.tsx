"use client";

import React, { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Code2 } from "lucide-react";

interface MonacoEditorInstance {
  deltaDecorations: (oldDecorations: string[], newDecorations: unknown[]) => string[];
  revealLineInCenterIfOutsideViewport: (lineNumber: number) => void;
}

interface CodeEditorProps {
  code?: string;
  currentLine?: number;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code = "// Select an algorithm to view source code",
  currentLine,
  readOnly = true,
  onChange,
}) => {
  const monaco = useMonaco();
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // Function when Monaco editor mounts
  const handleEditorDidMount = (editor: MonacoEditorInstance) => {
    editorRef.current = editor;
  };

  // Synchronize current line decoration in Monaco Editor
  useEffect(() => {
    if (!editorRef.current || !monaco || currentLine === undefined || currentLine <= 0) {
      return;
    }

    const editor = editorRef.current;

    // Apply active line decoration highlight
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: "monaco-active-line-highlight",
          glyphMarginClassName: "monaco-active-line-glyph",
        },
      },
    ]);

    // Scroll active line into center of viewport
    editor.revealLineInCenterIfOutsideViewport(currentLine);
  }, [currentLine, monaco]);

  const lines = code.split("\n");

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" /> Source Code
        </h2>
        {currentLine !== undefined && currentLine > 0 && (
          <span className="text-xs font-mono text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 font-bold shadow-sm">
            Line {currentLine}
          </span>
        )}
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(val) => onChange?.(val || "")}
          onMount={(editor) => handleEditorDidMount(editor as unknown as MonacoEditorInstance)}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            folding: true,
            renderLineHighlight: "all",
            domReadOnly: true,
          }}
          loading={
            <div className="flex-1 p-4 font-mono text-xs overflow-auto select-none bg-slate-950">
              {lines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isCurrent = lineNum === currentLine;
                return (
                  <div
                    key={idx}
                    className={`flex items-center px-2 py-0.5 rounded transition-colors ${
                      isCurrent
                        ? "bg-cyan-950/80 border-l-4 border-cyan-400 text-cyan-200 font-bold"
                        : "text-slate-400 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="w-8 text-right pr-4 text-slate-600 select-none">{lineNum}</span>
                    <pre className="flex-1 font-mono whitespace-pre">{lineText}</pre>
                  </div>
                );
              })}
            </div>
          }
        />
      </div>

      <style jsx global>{`
        .monaco-active-line-highlight {
          background-color: rgba(6, 182, 212, 0.18) !important;
          border-left: 4px solid #22d3ee !important;
        }
        .monaco-active-line-glyph {
          background-color: #22d3ee !important;
          width: 4px !important;
        }
      `}</style>
    </div>
  );
};
