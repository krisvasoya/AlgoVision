import type { ASTNode, SourceRange } from "./types.ts";

export function parseSourceCode(code: string): ASTNode {
  const lines = code.split("\n");
  let nodeIdCounter = 0;

  function createRange(startLine: number, startCol: number, endLine: number, endCol: number): SourceRange {
    return {
      start: { line: startLine, column: startCol },
      end: { line: endLine, column: endCol },
    };
  }

  const rootChildren: ASTNode[] = [];

  // Parse lines to build structured AST nodes
  lines.forEach((lineText, lineIdx) => {
    const lineNo = lineIdx + 1;
    const trimmed = lineText.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      return;
    }

    // Function Declaration match: function name(arg1, arg2)
    const funcMatch = trimmed.match(/^function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const params = funcMatch[2].split(",").map((p) => p.trim()).filter(Boolean);

      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "FunctionDeclaration",
        name: funcName,
        range: createRange(lineNo, lineText.indexOf("function"), lineNo, lineText.length),
        raw: trimmed,
        metadata: { params, funcName },
      });
      return;
    }

    // Variable Declaration: let / const / var x = ...
    const varMatch = trimmed.match(/^(let|const|var)\s+([a-zA-Z0-9_$]+)\s*(=|\;)/);
    if (varMatch) {
      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "VariableDeclaration",
        name: varMatch[2],
        range: createRange(lineNo, lineText.indexOf(varMatch[1]), lineNo, lineText.length),
        raw: trimmed,
        metadata: { kind: varMatch[1], name: varMatch[2] },
      });
    }

    // If Statement: if (...)
    if (trimmed.startsWith("if ") || trimmed.startsWith("if(")) {
      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "IfStatement",
        range: createRange(lineNo, lineText.indexOf("if"), lineNo, lineText.length),
        raw: trimmed,
      });
    }

    // Loops: for / while
    if (trimmed.startsWith("for ") || trimmed.startsWith("for(")) {
      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "ForStatement",
        range: createRange(lineNo, lineText.indexOf("for"), lineNo, lineText.length),
        raw: trimmed,
      });
    } else if (trimmed.startsWith("while ") || trimmed.startsWith("while(")) {
      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "WhileStatement",
        range: createRange(lineNo, lineText.indexOf("while"), lineNo, lineText.length),
        raw: trimmed,
      });
    }

    // Return Statement: return ...
    if (trimmed.startsWith("return ") || trimmed === "return;" || trimmed.startsWith("return(")) {
      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "ReturnStatement",
        range: createRange(lineNo, lineText.indexOf("return"), lineNo, lineText.length),
        raw: trimmed,
      });
    }

    // Function Calls: callee(...)
    const callMatch = trimmed.match(/([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/);
    if (callMatch && !funcMatch && !trimmed.startsWith("if") && !trimmed.startsWith("for") && !trimmed.startsWith("while")) {
      const callee = callMatch[1];
      const args = callMatch[2].split(",").map((a) => a.trim()).filter(Boolean);

      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "CallExpression",
        name: callee,
        range: createRange(lineNo, lineText.indexOf(callee), lineNo, lineText.length),
        raw: trimmed,
        metadata: { callee, args },
      });
    }

    // Array Access: arr[i]
    if (trimmed.includes("[") && trimmed.includes("]")) {
      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "MemberExpression",
        range: createRange(lineNo, 0, lineNo, lineText.length),
        raw: trimmed,
      });
    }

    // Check for unsupported constructs
    if (
      trimmed.includes("async ") ||
      trimmed.includes("await ") ||
      trimmed.includes("Promise") ||
      trimmed.includes("import ") ||
      trimmed.includes("require(") ||
      trimmed.includes("eval(") ||
      trimmed.includes("document.") ||
      trimmed.includes("window.") ||
      trimmed.includes("fetch(")
    ) {
      rootChildren.push({
        id: `node-${nodeIdCounter++}`,
        type: "UnsupportedNode",
        range: createRange(lineNo, 0, lineNo, lineText.length),
        raw: trimmed,
      });
    }
  });

  return {
    id: "root-program",
    type: "Program",
    range: createRange(1, 0, lines.length, lines[lines.length - 1]?.length || 0),
    children: rootChildren,
  };
}
