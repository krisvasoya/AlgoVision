import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";

describe("Static Code Analysis Unit Tests", () => {
  it("should analyze Factorial example case without executing code", () => {
    const factorialCode = `function factorial(n) {
  if (n <= 1) {
    return 1;
  }

  return n * factorial(n - 1);
}`;

    const analysis = CodeAnalyzer.analyze(factorialCode);

    assert.equal(analysis.isValid, true);
    assert.equal(analysis.functions.length, 1);

    const func = analysis.functions[0];
    assert.equal(func.name, "factorial");
    assert.deepEqual(func.params, ["n"]);
    assert.equal(func.isRecursive, true);
    assert.deepEqual(func.returns, [3, 6]);

    assert.equal(analysis.recursion.isRecursive, true);
    assert.deepEqual(analysis.recursion.recursiveFunctions, ["factorial"]);
    assert.deepEqual(analysis.recursion.recursiveCallLines, [6]);

    assert.equal(analysis.patternMetadata?.detectedPattern, "Factorial");
  });

  it("should detect loops and variables in Bubble Sort source code", () => {
    const bubbleCode = `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`;

    const analysis = CodeAnalyzer.analyze(bubbleCode);

    assert.equal(analysis.functions.length, 1);
    assert.equal(analysis.functions[0].name, "bubbleSort");
    assert.equal(analysis.loops.length, 2);
    assert.equal(analysis.recursion.isRecursive, false);
    assert.equal(analysis.patternMetadata?.detectedPattern, "Bubble Sort");
  });

  it("should reject unsupported constructs (async/await, DOM APIs, eval)", () => {
    const unsafeCode = `async function fetchData() {
  const res = await fetch("https://api.example.com");
  document.getElementById("out").innerText = res;
  eval("console.log(1)");
}`;

    const analysis = CodeAnalyzer.analyze(unsafeCode);

    assert.equal(analysis.isValid, false);
    assert.equal(analysis.unsupportedConstructs.length >= 3, true);
  });
});
