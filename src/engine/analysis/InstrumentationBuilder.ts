import type { InstrumentationPoint, ProgramAnalysis } from "./types.ts";
import type { ExecutionEventType } from "../../types/execution.ts";

export class InstrumentationBuilder {
  public static buildPoints(analysis: ProgramAnalysis): InstrumentationPoint[] {
    const points: InstrumentationPoint[] = [];
    let pointCounter = 0;

    // 1. Function Call Points
    analysis.functions.forEach((func) => {
      points.push({
        id: `instr-${pointCounter++}`,
        line: func.startLine,
        eventType: "call",
        sourceNodeId: `func-${func.name}`,
        description: `Function entry: ${func.name}(${func.params.join(", ")})`,
      });
    });

    // 2. Loop Points
    analysis.loops.forEach((loop) => {
      points.push({
        id: `instr-${pointCounter++}`,
        line: loop.line,
        eventType: "loop",
        sourceNodeId: `loop-L${loop.line}`,
        description: `Loop execution at line ${loop.line}`,
      });
    });

    // 3. Variable Points
    analysis.variables.forEach((variable) => {
      points.push({
        id: `instr-${pointCounter++}`,
        line: variable.line,
        eventType: "assign",
        sourceNodeId: `var-${variable.name}`,
        description: `Variable assignment: ${variable.name}`,
      });
    });

    // 4. Function Calls
    analysis.calls.forEach((call) => {
      const eventType: ExecutionEventType = call.isRecursiveCall ? "call" : "access";
      points.push({
        id: `instr-${pointCounter++}`,
        line: call.line,
        eventType,
        sourceNodeId: `call-${call.callee}-L${call.line}`,
        description: `${call.isRecursiveCall ? "Recursive call" : "Function call"}: ${call.callee}()`,
      });
    });

    // 5. Function Return Points
    analysis.functions.forEach((func) => {
      func.returns.forEach((retLine) => {
        const isBaseCase = func.isRecursive && retLine < func.endLine - 1;
        const eventType: ExecutionEventType = isBaseCase ? "base_case" : "return";

        points.push({
          id: `instr-${pointCounter++}`,
          line: retLine,
          eventType,
          sourceNodeId: `return-${func.name}-L${retLine}`,
          description: `Return statement in ${func.name} at line ${retLine}`,
        });
      });
    });

    // Sort by line number for clean step ordering
    return points.sort((a, b) => a.line - b.line);
  }
}
