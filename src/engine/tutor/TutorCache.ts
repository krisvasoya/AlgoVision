import type { TutorResponse, TutorRequestType } from "./types.ts";

export class TutorCache {
  private static cache = new Map<string, TutorResponse>();

  public static get(
    sourceCode: string,
    initialInput: unknown,
    stepIndex: number,
    requestType: TutorRequestType
  ): TutorResponse | undefined {
    const key = this.makeKey(sourceCode, initialInput, stepIndex, requestType);
    return this.cache.get(key);
  }

  public static set(
    sourceCode: string,
    initialInput: unknown,
    stepIndex: number,
    requestType: TutorRequestType,
    response: TutorResponse
  ): void {
    const key = this.makeKey(sourceCode, initialInput, stepIndex, requestType);
    this.cache.set(key, response);
  }

  public static clear(): void {
    this.cache.clear();
  }

  private static makeKey(
    sourceCode: string,
    initialInput: unknown,
    stepIndex: number,
    requestType: TutorRequestType
  ): string {
    const codeLen = sourceCode.length;
    const inputStr = JSON.stringify(initialInput || {});
    return `${codeLen}-${inputStr}-${stepIndex}-${requestType}`;
  }
}
