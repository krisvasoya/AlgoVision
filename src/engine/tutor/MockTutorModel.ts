import type { TutorModel, TutorContext, TutorRequest, TutorResponse } from "./types.ts";

export class MockTutorModel implements TutorModel {
  public async generateExplanation(context: TutorContext, request: TutorRequest): Promise<TutorResponse> {
    const stepNo = context.currentStep.step + 1;
    const event = context.eventType;
    const line = context.currentLine || 1;
    const varsStr = Object.entries(context.variables)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(", ");

    switch (request.type) {
      case "explain_step": {
        return {
          type: "explanation",
          response: `At Step ${stepNo} (Line ${line}), the algorithm is executing '${event}'. Current variables: ${varsStr || "none"}. ${context.currentStep.metadata?.description || ""}`,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
        };
      }

      case "why": {
        let rationale = `The algorithm executed '${event}' because of the logical condition on Line ${line}.`;
        if (event === "compare") {
          rationale = `The algorithm is comparing values at Step ${stepNo} to determine if elements are in order. Current variables: ${varsStr}.`;
        } else if (event === "swap") {
          rationale = `A swap occurred because the prior comparison condition evaluated to true. Current variables: ${varsStr}.`;
        } else if (event === "call") {
          rationale = `The function was invoked recursively to solve the smaller subproblem. Active frame: ${context.runtimeState?.callStack[context.runtimeState.callStack.length - 1]?.functionName || "main"}.`;
        }
        return {
          type: "explanation",
          response: rationale,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
        };
      }

      case "explain_simple": {
        return {
          type: "explanation",
          response: `Simply put: On Line ${line}, we checked the data (${varsStr || "values"}) and took the next step in our algorithm.`,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
        };
      }

      case "hint": {
        const level = request.hintLevel || 1;
        let hintText = `Hint 1: Look at the values in variables (${varsStr}).`;
        if (level === 2) {
          hintText = `Hint 2: Pay attention to what condition is being tested on Line ${line}.`;
        } else if (level >= 3) {
          hintText = `Hint 3: Notice how event '${event}' updates the execution state.`;
        }
        return {
          type: "hint",
          response: hintText,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
        };
      }

      case "what_next": {
        const nextEvt = context.nextStep?.event || "complete";
        return {
          type: "quiz",
          response: `What event will occur next?`,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
          expectedEvent: nextEvt,
          quizOptions: [nextEvt, "compare", "swap", "return"].filter(
            (v, i, a) => a.indexOf(v) === i
          ),
        };
      }

      case "quiz": {
        return {
          type: "quiz",
          response: `Quiz: What is the active state of variables at Step ${stepNo}? (${varsStr})`,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
        };
      }

      case "check_answer": {
        const studentAns = (request.studentAnswer || "").toLowerCase();
        const expectedEvt = (context.nextStep?.event || context.eventType).toLowerCase();

        const isCorrect = studentAns.includes(expectedEvt) || studentAns.length > 2;

        return {
          type: "answer_check",
          response: isCorrect
            ? `Correct! Grounded in trace evidence: expected event '${expectedEvt}' matches current state.`
            : `Not quite. Based on the trace evidence, the expected operation is '${expectedEvt}'.`,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
          expectedEvent: context.nextStep?.event || context.eventType,
        };
      }

      default:
        return {
          type: "explanation",
          response: `Grounded explanation for Step ${stepNo} (${event}).`,
          confidence: 1.0,
          referencedStep: context.currentStep.step,
        };
    }
  }
}
