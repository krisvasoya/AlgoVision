import assert from "node:assert/strict";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";
import { SandboxRuntime } from "../engine/runtime/SandboxRuntime.ts";
import { VisualizationInferenceEngine } from "../engine/visualization/VisualizationInferenceEngine.ts";

export function assertEquivalentInference(
  codeA: string,
  inputA: Record<string, unknown>,
  codeB: string,
  inputB: Record<string, unknown>
) {
  const analysisA = CodeAnalyzer.analyze(codeA);
  const resA = SandboxRuntime.execute(codeA, inputA);
  const inferenceA = VisualizationInferenceEngine.infer(analysisA, resA.events, codeA);

  const analysisB = CodeAnalyzer.analyze(codeB);
  const resB = SandboxRuntime.execute(codeB, inputB);
  const inferenceB = VisualizationInferenceEngine.infer(analysisB, resB.events, codeB);

  assert.equal(inferenceA.type, inferenceB.type, `Inference type mismatch: ${inferenceA.type} !== ${inferenceB.type}`);
  assert.equal(
    inferenceA.confidence >= 0.8,
    inferenceB.confidence >= 0.8,
    `Confidence category mismatch: ${inferenceA.confidence} vs ${inferenceB.confidence}`
  );
  assert.equal(
    inferenceA.observedBehaviors.length > 0,
    inferenceB.observedBehaviors.length > 0,
    `Observed behaviors should be present for both variants`
  );
}
