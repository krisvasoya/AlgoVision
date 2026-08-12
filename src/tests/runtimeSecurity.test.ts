import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SandboxRuntime } from "../engine/runtime/SandboxRuntime.ts";

describe("Sandbox Runtime Security Protections Unit Tests", () => {
  it("should reject fetch() call before execution via static gate", () => {
    const code = `function test() { return fetch("https://example.com"); }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should reject document DOM API access", () => {
    const code = `function test() { document.body.innerHTML = "hack"; }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should reject window DOM API access", () => {
    const code = `function test() { return window.location; }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should reject eval() execution", () => {
    const code = `function test() { return eval("1 + 1"); }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should reject new Function() execution", () => {
    const code = `function test() { const fn = new Function("return 1"); return fn(); }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should reject import / require module calls", () => {
    const code = `function test() { const fs = require("fs"); }`;
    const res = SandboxRuntime.execute(code);
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("UNSUPPORTED_CONSTRUCT"), true);
  });

  it("should terminate infinite loop via step limit guard", () => {
    const code = `function loop() { while(true) {} }`;
    const res = SandboxRuntime.execute(code, {}, { maxSteps: 10 });
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("STEP_LIMIT_EXCEEDED"), true);
  });

  it("should terminate excessive recursion via stack depth limit guard", () => {
    const code = `function infRec(n) { return infRec(n + 1); }`;
    const res = SandboxRuntime.execute(code, { n: 1 }, { maxStackDepth: 5 });
    assert.equal(res.status, "error");
    assert.equal(res.error?.includes("STACK_DEPTH_EXCEEDED"), true);
  });
});
