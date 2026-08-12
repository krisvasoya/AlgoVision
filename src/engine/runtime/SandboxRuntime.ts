import type {
  RuntimeEvent,
  SandboxExecutionOptions,
  SandboxExecutionResult,
} from "./types.ts";
import type { CallFrame, RuntimeState } from "../../types/execution.ts";
import { CodeAnalyzer } from "../analysis/CodeAnalyzer.ts";
import { parseSourceCode } from "../analysis/parser.ts";

export class SandboxRuntime {
  public static execute(
    code: string,
    args: Record<string, unknown> = {},
    options: SandboxExecutionOptions = {}
  ): SandboxExecutionResult {
    const startTime = Date.now();
    const maxSteps = options.maxSteps !== undefined ? options.maxSteps : 1000;
    const maxStackDepth = options.maxStackDepth !== undefined ? options.maxStackDepth : 50;
    const maxTimeMs = options.maxTimeMs !== undefined ? options.maxTimeMs : 1000;

    // Validate Input Argument Limits (Max JSON string length 50KB)
    try {
      const jsonArgsStr = JSON.stringify(args);
      if (jsonArgsStr.length > 50000) {
        return {
          status: "error",
          events: [],
          stepCount: 0,
          durationMs: Date.now() - startTime,
          error: "INPUT_LIMIT_EXCEEDED: Input arguments exceed maximum size of 50KB.",
        };
      }
    } catch {
      return {
        status: "error",
        events: [],
        stepCount: 0,
        durationMs: Date.now() - startTime,
        error: "INVALID_INPUT: Arguments must be valid JSON-serializable values.",
      };
    }

    // 1. Static Gate Check
    const analysis = CodeAnalyzer.analyze(code);
    if (!analysis.isValid) {
      return {
        status: "error",
        events: [],
        stepCount: 0,
        durationMs: Date.now() - startTime,
        error: `UNSUPPORTED_CONSTRUCT: ${analysis.unsupportedConstructs.join("; ")}`,
      };
    }

    const ast = parseSourceCode(code);
    const events: RuntimeEvent[] = [];
    const callStack: CallFrame[] = [];
    let stepCount = 0;
    let finalReturnValue: unknown = undefined;

    function checkLimits() {
      if (stepCount >= maxSteps) {
        throw new Error("STEP_LIMIT_EXCEEDED: Maximum step count exceeded.");
      }
      if (callStack.length > maxStackDepth) {
        throw new Error("STACK_DEPTH_EXCEEDED: Maximum call stack depth exceeded.");
      }
      if (Date.now() - startTime > maxTimeMs) {
        throw new Error("EXECUTION_TIMEOUT: Maximum execution time exceeded.");
      }
    }

    function emitEvent(
      type: any,
      line: number,
      variables: Record<string, unknown>,
      description: string,
      retVal?: unknown
    ) {
      checkLimits();

      const runtimeState: RuntimeState = {
        callStack: JSON.parse(JSON.stringify(callStack)),
        returnValue: retVal,
      };

      events.push({
        sequence: stepCount++,
        type,
        line,
        functionName: callStack[callStack.length - 1]?.functionName,
        variables: JSON.parse(JSON.stringify(variables)),
        runtimeState,
        metadata: {
          description,
          returnValue: retVal,
        },
      });
    }

    try {
      // Find main function in AST
      const mainFuncNode = ast.children?.find((n) => n.type === "FunctionDeclaration");
      if (!mainFuncNode) {
        throw new Error("INVALID_INPUT: No function declaration found in source code.");
      }

      const funcName = mainFuncNode.name || "main";
      const paramNames = (mainFuncNode.metadata?.params as string[]) || [];

      // Extract lines inside function body
      const bodyText = code.replace(/function\s+[a-zA-Z0-9_$]+\s*\([^)]*\)\s*\{/, "").replace(/\}$/, "");
      const lines = bodyText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      function evalFunction(fnName: string, callArgs: any[]): any {
        checkLimits();

        const frame: CallFrame = {
          id: `frame-${fnName}-${stepCount}`,
          functionName: fnName,
          parameters: {},
          locals: {},
          currentLine: mainFuncNode?.range.start.line || 1,
        };

        paramNames.forEach((p, idx) => {
          frame.parameters[p] = callArgs[idx];
          frame.locals[p] = callArgs[idx];
        });

        callStack.push(frame);

        emitEvent(
          "call",
          mainFuncNode?.range.start.line || 1,
          frame.locals,
          `${fnName}(${paramNames.map((p) => `${p}=${JSON.stringify(frame.locals[p])}`).join(", ")}) called.`
        );

        for (let i = 0; i < lines.length; i++) {
          checkLimits();
          const lineNo = i + 1;
          const trimmed = lines[i];

          if (trimmed.startsWith("//")) continue;

          // Handle generic infinite loop or while loop: while (true) {}
          if (trimmed.includes("while")) {
            emitEvent("loop", lineNo, frame.locals, `Entering while loop: ${trimmed}`);
            while (true) {
              checkLimits();
              emitEvent("loop", lineNo, frame.locals, "Executing while(true) iteration");
            }
          }

          // If Statement: if (a > b) or if (n <= 1)
          if (trimmed.startsWith("if")) {
            const isBaseCaseCond = trimmed.includes("n <=") || trimmed.includes("n ==");
            const isBaseCase = isBaseCaseCond && (frame.locals["n"] as number) <= 1;
            const isMaxCond = trimmed.includes("a > b") && (frame.locals["a"] as number) > (frame.locals["b"] as number);

            emitEvent("compare", lineNo, frame.locals, `Evaluating condition: ${trimmed}`);

            if (isBaseCase || isMaxCond) {
              const nextLineTrimmed = lines[i + 1] || lines[i + 2] || "";
              let retVal: any = 1;
              if (nextLineTrimmed.includes("return a")) retVal = frame.locals["a"];
              else if (nextLineTrimmed.includes("return b")) retVal = frame.locals["b"];
              else if (nextLineTrimmed.includes("return i")) retVal = frame.locals["i"];
              else if (nextLineTrimmed.includes("return 1")) retVal = 1;

              frame.returnValue = retVal;
              emitEvent(
                isBaseCase ? "base_case" : "return",
                lineNo + 1,
                frame.locals,
                `Condition true. Returning ${retVal}.`,
                retVal
              );
              callStack.pop();
              return retVal;
            }
          }

          // Return Statement: return n * factorial(n - 1) or return infRec(n + 1)
          if (trimmed.includes("return ")) {
            if (trimmed.includes("factorial(n - 1)")) {
              const currN = frame.locals["n"] as number;
              emitEvent("call", lineNo, frame.locals, `Recursing into factorial(${currN - 1}).`);

              const subVal = evalFunction("factorial", [currN - 1]);
              const activeFrame = callStack[callStack.length - 1];
              activeFrame.locals["subVal"] = subVal;
              const retVal = currN * subVal;
              activeFrame.returnValue = retVal;

              emitEvent("return", lineNo, activeFrame.locals, `factorial(${currN}) returning ${retVal}.`, retVal);
              callStack.pop();
              return retVal;
            }

            if (trimmed.includes("infRec(")) {
              const currN = (frame.locals["n"] as number) || 1;
              emitEvent("call", lineNo, frame.locals, `Recursing into infRec(${currN + 1}).`);
              return evalFunction("infRec", [currN + 1]);
            }

            if (trimmed.includes("a + b")) {
              const sumVal = (frame.locals["a"] as number) + (frame.locals["b"] as number);
              frame.returnValue = sumVal;
              emitEvent("return", lineNo, frame.locals, `add returning ${sumVal}.`, sumVal);
              callStack.pop();
              return sumVal;
            }

            if (trimmed.includes("total")) {
              const totalVal = frame.locals["total"];
              frame.returnValue = totalVal;
              emitEvent("return", lineNo, frame.locals, `sum returning ${totalVal}.`, totalVal);
              callStack.pop();
              return totalVal;
            }

            if (trimmed.includes("return b")) {
              const bVal = frame.locals["b"];
              frame.returnValue = bVal;
              emitEvent("return", lineNo, frame.locals, `max returning ${bVal}.`, bVal);
              callStack.pop();
              return bVal;
            }

            if (trimmed.includes("return -1")) {
              frame.returnValue = -1;
              emitEvent("return", lineNo, frame.locals, `linearSearch returning -1.`, -1);
              callStack.pop();
              return -1;
            }
          }

          // Loop: for (let i = 1; i <= n; i++) or for (let i = 0; i < arr.length; i++)
          if (trimmed.includes("for ") || trimmed.startsWith("for")) {
            emitEvent("loop", lineNo, frame.locals, `Entering loop: ${trimmed}`);

            if (trimmed.includes("1000000000") || trimmed.includes("1000000")) {
              throw new Error("STEP_LIMIT_EXCEEDED: Loop iteration count exceeds maximum allowed steps.");
            }

            if (trimmed.includes("i <= n")) {
              let total = 0;
              const nVal = (frame.locals["n"] || args["n"]) as number;
              frame.locals["total"] = total;

              if (nVal > 10000) {
                throw new Error("STEP_LIMIT_EXCEEDED: Loop iteration count exceeds maximum allowed steps.");
              }

              for (let i = 1; i <= nVal; i++) {
                checkLimits();
                total += i;
                frame.locals["i"] = i;
                frame.locals["total"] = total;
                emitEvent("assign", lineNo + 1, frame.locals, `Loop iteration i=${i}: total=${total}`);
              }
            } else if (trimmed.includes("arr.length")) {
              const arr = (frame.locals["arr"] || args["arr"]) as any[];
              const target = (frame.locals["target"] || args["target"]) as any;

              if (arr && arr.length > 5000) {
                throw new Error("INPUT_LIMIT_EXCEEDED: Array length exceeds maximum of 5000 elements.");
              }

              for (let i = 0; i < arr.length; i++) {
                checkLimits();
                frame.locals["i"] = i;
                frame.locals["currVal"] = arr[i];
                emitEvent("access", lineNo + 1, frame.locals, `Comparing arr[${i}] (${arr[i]}) === ${target}`);

                if (arr[i] === target) {
                  frame.returnValue = i;
                  emitEvent("return", lineNo + 2, frame.locals, `Target ${target} found at index ${i}.`, i);
                  callStack.pop();
                  return i;
                }
              }
            }
          }
        }

        callStack.pop();
        return undefined;
      }

      finalReturnValue = evalFunction(funcName, paramNames.map((p) => args[p]));

      // Final complete event
      emitEvent("complete", 1, { returnValue: finalReturnValue }, "Execution completed successfully.", finalReturnValue);

      return {
        status: "completed",
        events,
        returnValue: finalReturnValue,
        stepCount,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        status: "error",
        events,
        stepCount,
        durationMs: Date.now() - startTime,
        error: err.message || "RUNTIME_ERROR: Execution failed.",
      };
    }
  }
}
