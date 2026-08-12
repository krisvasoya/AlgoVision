import type { TutorResponse } from "./types.ts";

export class TutorResponseValidator {
  public static validate(response: unknown): TutorResponse {
    if (!response || typeof response !== "object") {
      return {
        type: "explanation",
        response: "Tutor temporarily unavailable. Unable to parse AI response.",
        confidence: 0.0,
      };
    }

    const res = response as Partial<TutorResponse>;

    const validTypes = ["explanation", "hint", "quiz", "answer_check"];
    const type = validTypes.includes(res.type || "") ? (res.type as any) : "explanation";
    const text = typeof res.response === "string" && res.response.trim().length > 0
      ? res.response
      : "No detailed explanation available for this step.";

    return {
      type,
      response: text,
      confidence: typeof res.confidence === "number" ? res.confidence : 1.0,
      referencedStep: typeof res.referencedStep === "number" ? res.referencedStep : undefined,
      expectedEvent: res.expectedEvent,
      quizOptions: Array.isArray(res.quizOptions) ? res.quizOptions : undefined,
    };
  }
}
