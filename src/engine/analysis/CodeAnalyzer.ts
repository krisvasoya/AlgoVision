import type {
  ProgramAnalysis,
  FunctionInfo,
  VariableInfo,
  LoopInfo,
  FunctionCallInfo,
  RecursionInfo,
} from "./types.ts";
import { parseSourceCode } from "./parser.ts";

export class CodeAnalyzer {
  public static analyze(code: string): ProgramAnalysis {
    const unsupportedConstructs: string[] = [];

    // Max code length limit (5000 characters)
    if (code.length > 5000) {
      unsupportedConstructs.push("Source code exceeds maximum allowed length of 5000 characters.");
    }

    const ast = parseSourceCode(code);
    const lines = code.split("\n");

    const functions: FunctionInfo[] = [];
    const variables: VariableInfo[] = [];
    const loops: LoopInfo[] = [];
    const calls: FunctionCallInfo[] = [];

    // Scan for unsupported constructs & prototype escape attempts
    lines.forEach((lineText, idx) => {
      const lineNo = idx + 1;
      if (lineText.includes("async ") || lineText.includes("await ")) {
        unsupportedConstructs.push(`Line ${lineNo}: Async/await is not supported in the execution engine.`);
      }
      if (lineText.includes("import ") || lineText.includes("require(")) {
        unsupportedConstructs.push(`Line ${lineNo}: Modules (import / require) are not supported.`);
      }
      if (lineText.includes("Promise")) {
        unsupportedConstructs.push(`Line ${lineNo}: Promises are not supported in the execution engine.`);
      }
      if (lineText.includes("eval(") || lineText.includes("Function")) {
        unsupportedConstructs.push(`Line ${lineNo}: Dynamic code evaluation (eval / Function) is prohibited.`);
      }
      if (lineText.includes("document.") || lineText.includes("window.")) {
        unsupportedConstructs.push(`Line ${lineNo}: DOM APIs (document/window) are not supported.`);
      }
      if (lineText.includes("fetch(") || lineText.includes("XMLHttpRequest")) {
        unsupportedConstructs.push(`Line ${lineNo}: Network requests are not supported.`);
      }

      // Prototype Escape Protections
      if (
        lineText.includes("__proto__") ||
        lineText.includes("constructor") ||
        lineText.includes("prototype") ||
        lineText.includes("globalThis") ||
        lineText.includes("self") ||
        lineText.includes("global") ||
        lineText.includes("Reflect") ||
        lineText.includes("Proxy")
      ) {
        unsupportedConstructs.push(`Line ${lineNo}: Access to prototype / global reflective objects is prohibited.`);
      }
    });

    // Traverse AST nodes
    const children = ast.children || [];
    let currentFunction: FunctionInfo | null = null;

    children.forEach((node) => {
      if (node.type === "FunctionDeclaration") {
        const funcName = node.name || "anonymous";
        const params = (node.metadata?.params as string[]) || [];

        let endLine = node.range.start.line;
        for (let i = node.range.start.line - 1; i < lines.length; i++) {
          if (lines[i].includes("}")) {
            endLine = i + 1;
            break;
          }
        }

        const funcInfo: FunctionInfo = {
          name: funcName,
          params,
          startLine: node.range.start.line,
          endLine,
          isRecursive: false,
          returns: [],
          range: node.range,
        };

        functions.push(funcInfo);
        currentFunction = funcInfo;

        params.forEach((param) => {
          variables.push({
            name: param,
            kind: "parameter",
            line: node.range.start.line,
          });
        });
      }

      if (node.type === "VariableDeclaration") {
        const varName = node.name || "temp";
        const kind = (node.metadata?.kind as any) || "let";
        variables.push({
          name: varName,
          kind,
          line: node.range.start.line,
        });
      }

      if (node.type === "ForStatement" || node.type === "WhileStatement") {
        loops.push({
          type: node.type === "ForStatement" ? "for" : "while",
          line: node.range.start.line,
          range: node.range,
        });
      }

      if (node.type === "ReturnStatement") {
        if (currentFunction) {
          currentFunction.returns.push(node.range.start.line);
        }
      }

      if (node.type === "CallExpression") {
        const callee = (node.metadata?.callee as string) || node.name || "";
        const args = (node.metadata?.args as string[]) || [];

        const isRecCall = currentFunction !== null && currentFunction.name === callee;

        calls.push({
          callee,
          args,
          line: node.range.start.line,
          isRecursiveCall: isRecCall,
          range: node.range,
        });

        if (isRecCall && currentFunction) {
          currentFunction.isRecursive = true;
        }
      }
    });

    const recursiveFuncs = functions.filter((f) => f.isRecursive).map((f) => f.name);
    const recursiveCallLines = calls.filter((c) => c.isRecursiveCall).map((c) => c.line);

    const recursion: RecursionInfo = {
      isRecursive: recursiveFuncs.length > 0,
      recursiveFunctions: recursiveFuncs,
      recursiveCallLines,
    };

    let detectedPattern: string | undefined = undefined;
    const codeText = code.toLowerCase();

    if (codeText.includes("factorial") || (recursion.isRecursive && codeText.includes("n *"))) {
      detectedPattern = "Factorial";
    } else if (codeText.includes("fib") || (recursion.isRecursive && codeText.includes("fib("))) {
      detectedPattern = "Fibonacci";
    } else if (codeText.includes("bubble") || (loops.length >= 2 && codeText.includes("swap"))) {
      detectedPattern = "Bubble Sort";
    } else if (codeText.includes("binarysearch") || (codeText.includes("mid") && codeText.includes("low"))) {
      detectedPattern = "Binary Search";
    } else if (codeText.includes("linear") || (loops.length === 1 && codeText.includes("target"))) {
      detectedPattern = "Linear Search";
    }

    const isValid = unsupportedConstructs.length === 0;

    return {
      functions,
      variables,
      loops,
      calls,
      recursion,
      unsupportedConstructs,
      isValid,
      validationMessage: isValid
        ? "Source code analysis complete. Compatible with restricted interpreter."
        : "Unsupported or restricted JavaScript constructs detected.",
      patternMetadata: {
        detectedPattern,
      },
    };
  }
}
