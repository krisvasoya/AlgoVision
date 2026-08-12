import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SandboxRuntime } from "../engine/runtime/SandboxRuntime.ts";
import { TraceAdapter } from "../engine/runtime/TraceAdapter.ts";

describe("Sandboxed Runtime Execution & Determinism Unit Tests", () => {
  it("should execute Example 1: Arithmetic add(a, b)", () => {
    const code = `function add(a, b) {\n  return a + b;\n}`;
    const res = SandboxRuntime.execute(code, { a: 5, b: 7 });

    assert.equal(res.status, "completed");
    assert.equal(res.returnValue, 12);
    assert.equal(res.events.length > 0, true);
  });

  it("should execute Example 2: Condition max(a, b)", () => {
    const code = `function max(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}`;
    const res1 = SandboxRuntime.execute(code, { a: 12, b: 8 });
    assert.equal(res1.returnValue, 12);

    const res2 = SandboxRuntime.execute(code, { a: 4, b: 15 });
    assert.equal(res2.returnValue, 15);
  });

  it("should execute Example 3: Loop sum(n)", () => {
    const code = `function sum(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total = total + i;\n  }\n  return total;\n}`;
    const res = SandboxRuntime.execute(code, { n: 5 });

    assert.equal(res.status, "completed");
    assert.equal(res.returnValue, 15);
  });

  it("should execute Example 4: Recursion factorial(n)", () => {
    const code = `function factorial(n) {\n  if (n <= 1) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}`;
    const res = SandboxRuntime.execute(code, { n: 4 });

    assert.equal(res.status, "completed");
    assert.equal(res.returnValue, 24);

    const trace = TraceAdapter.adaptToTrace(code, { n: 4 }, res.events);
    assert.equal(trace.steps.length > 0, true);
  });

  it("should execute Example 5: Array linearSearch(arr, target)", () => {
    const code = `function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}`;
    const resFound = SandboxRuntime.execute(code, { arr: [10, 20, 30, 40], target: 30 });
    assert.equal(resFound.returnValue, 2);

    const resNotFound = SandboxRuntime.execute(code, { arr: [10, 20, 30, 40], target: 99 });
    assert.equal(resNotFound.returnValue, -1);
  });

  it("should guarantee 100% determinism across multiple execution runs", () => {
    const code = `function factorial(n) {\n  if (n <= 1) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}`;
    const run1 = SandboxRuntime.execute(code, { n: 4 });
    const run2 = SandboxRuntime.execute(code, { n: 4 });

    assert.equal(JSON.stringify(run1.events), JSON.stringify(run2.events));
    assert.equal(run1.returnValue, run2.returnValue);
  });

  it("should guarantee snapshot isolation upon external object mutation", () => {
    const code = `function add(a, b) {\n  return a + b;\n}`;
    const res = SandboxRuntime.execute(code, { a: 2, b: 3 });

    const step0Original = JSON.stringify(res.events[0]);
    (res.events[res.events.length - 1].variables as any)["a"] = 999;

    assert.equal(JSON.stringify(res.events[0]), step0Original);
  });
});
