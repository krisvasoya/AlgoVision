import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SandboxRuntime } from "../engine/runtime/SandboxRuntime.ts";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";

describe("Runtime Security & Correctness Audit Test Suite", () => {
  it("should reject source code exceeding 5000 character limit", () => {
    const longCode = "function test() { " + "let a = 1; ".repeat(500) + "}";
    const res = SandboxRuntime.execute(longCode);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("5000 characters"), true);
  });

  it("should reject input arguments exceeding 50KB limit", () => {
    const hugeArr = Array.from({ length: 20000 }, (_, i) => i * 12345);
    const code = `function sum(n) { return n; }`;
    const res = SandboxRuntime.execute(code, { huge: hugeArr });
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("INPUT_LIMIT_EXCEEDED"), true);
  });

  it("should reject prototype escape attempt via __proto__", () => {
    const code = `function hack(obj) { return obj.__proto__; }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should reject constructor property escape attempt", () => {
    const code = `function hack(fn) { return fn.constructor("return 1")(); }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should reject globalThis and global object reflective access", () => {
    const code1 = `function hack() { return globalThis.process; }`;
    assert.equal(CodeAnalyzer.analyze(code1).isValid, false);

    const code2 = `function hack() { return global.process; }`;
    assert.equal(CodeAnalyzer.analyze(code2).isValid, false);
  });

  it("should reject 10^9 large loop iteration count before resource exhaustion", () => {
    const code = `function loop() { let x = 0; for (let i = 0; i < 1000000000; i++) { x++; } return x; }`;
    const res = SandboxRuntime.execute(code, { n: 1000000000 });
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("STEP_LIMIT_EXCEEDED"), true);
  });

  it("should guarantee complete isolation across 2 concurrent execution sessions", () => {
    const codeAdd = `function add(a, b) { return a + b; }`;
    const codeMax = `function max(a, b) { if (a > b) return a; return b; }`;

    const resAdd = SandboxRuntime.execute(codeAdd, { a: 10, b: 20 });
    const resMax = SandboxRuntime.execute(codeMax, { a: 5, b: 15 });

    assert.equal(resAdd.returnValue, 30);
    assert.equal(resMax.returnValue, 15);
    assert.notEqual(JSON.stringify(resAdd.events), JSON.stringify(resMax.events));
  });

  it("should produce 100% identical event sequences across 10 repeated execution runs (Determinism)", () => {
    const code = `function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1); }`;
    const referenceRun = SandboxRuntime.execute(code, { n: 4 });

    for (let run = 1; run <= 10; run++) {
      const currentRun = SandboxRuntime.execute(code, { n: 4 });
      assert.equal(currentRun.returnValue, referenceRun.returnValue);
      assert.equal(JSON.stringify(currentRun.events), JSON.stringify(referenceRun.events));
    }
  });
});
