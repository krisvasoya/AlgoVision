import type { TutorModel, TutorContext, TutorRequest, TutorResponse } from "./types.ts";
import { TutorResponseValidator } from "./TutorResponseValidator.ts";
import { MockTutorModel } from "./MockTutorModel.ts";

export class ProductionTutorModel implements TutorModel {
  private fallbackModel: MockTutorModel;

  constructor() {
    this.fallbackModel = new MockTutorModel();
  }

  public async generateExplanation(context: TutorContext, request: TutorRequest): Promise<TutorResponse> {
    const provider = process.env.NEXT_PUBLIC_AI_PROVIDER || "mock";
    const apiEndpoint = process.env.AI_API_ENDPOINT;

    // If no external production provider is configured, fall back safely to MockTutorModel
    if (provider === "mock" || !apiEndpoint) {
      return this.handleGroundingGuard(context, request, await this.fallbackModel.generateExplanation(context, request));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout guard

      const promptPayload = this.buildPromptPayload(context, request);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promptPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
      }

      const json = await response.json();
      const validated = TutorResponseValidator.validate(json);
      return this.handleGroundingGuard(context, request, validated);
    } catch {
      // Non-blocking fallback failure recovery
      return {
        type: "explanation",
        response: "Tutor temporarily unavailable.",
        confidence: 0.0,
      };
    }
  }

  private handleGroundingGuard(context: TutorContext, request: TutorRequest, response: TutorResponse): TutorResponse {
    // Misleading question check: If student asks about values not in variables/code
    if (request.type === "check_answer" && request.studentAnswer) {
      const qLower = request.studentAnswer.toLowerCase();
      const vars = context.variables;
      const varValuesStr = JSON.stringify(vars).toLowerCase();

      // Check if question asks about specific numbers 0-99 not in current variables
      const matches = request.studentAnswer.match(/\b\d+\b/g);
      if (matches) {
        const absentNumbers = matches.filter((num) => !varValuesStr.includes(num));
        if (absentNumbers.length > 0) {
          return {
            type: "explanation",
            response: `Values ${absentNumbers.join(", ")} are not present in the current execution step (Step ${context.currentStep.step + 1}, Line ${context.currentLine}). Current step variables: ${JSON.stringify(vars)}.`,
            confidence: 1.0,
            referencedStep: context.currentStep.step,
          };
        }
      }
    }

    return response;
  }

  private buildPromptPayload(context: TutorContext, request: TutorRequest) {
    // Send ONLY minimal educational context (Zero auth, cookies, secrets)
    return {
      systemInstruction:
        "You are a Grounded AI Computer Science Tutor. You MUST reference ONLY the supplied execution context. NEVER invent variable values, step numbers, or execution events.",
      context: {
        algorithmName: context.algorithmName,
        stepNumber: context.currentStep.step + 1,
        line: context.currentLine,
        event: context.eventType,
        variables: context.variables,
        callStack: context.runtimeState?.callStack.map((f) => f.functionName),
      },
      requestType: request.type,
      studentQuery: request.studentAnswer,
    };
  }
}
