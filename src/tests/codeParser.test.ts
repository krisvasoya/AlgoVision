import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseSourceCode } from "../engine/analysis/parser.ts";

describe("Code Parser AST Unit Tests", () => {
  it("should parse function declaration and extract parameter list", () => {
    const code = `function sum(a, b) {\n  return a + b;\n}`;
    const ast = parseSourceCode(code);

    assert.equal(ast.type, "Program");
    assert.equal(ast.children?.length, 2);

    const funcNode = ast.children![0];
    assert.equal(funcNode.type, "FunctionDeclaration");
    assert.equal(funcNode.name, "sum");
    assert.deepEqual(funcNode.metadata?.params, ["a", "b"]);
    assert.equal(funcNode.range.start.line, 1);
  });

  it("should parse variable declarations and store source range mapping", () => {
    const code = `let x = 10;\nconst y = 20;`;
    const ast = parseSourceCode(code);

    const varNodes = ast.children!.filter((n) => n.type === "VariableDeclaration");
    assert.equal(varNodes.length, 2);
    assert.equal(varNodes[0].name, "x");
    assert.equal(varNodes[1].name, "y");
    assert.equal(varNodes[0].range.start.line, 1);
    assert.equal(varNodes[1].range.start.line, 2);
  });

  it("should parse if statements and return statements with line mapping", () => {
    const code = `function check(n) {\n  if (n <= 1) {\n    return 1;\n  }\n  return n;\n}`;
    const ast = parseSourceCode(code);

    const ifNodes = ast.children!.filter((n) => n.type === "IfStatement");
    const returnNodes = ast.children!.filter((n) => n.type === "ReturnStatement");

    assert.equal(ifNodes.length, 1);
    assert.equal(ifNodes[0].range.start.line, 2);

    assert.equal(returnNodes.length, 2);
    assert.equal(returnNodes[0].range.start.line, 3);
    assert.equal(returnNodes[1].range.start.line, 5);
  });

  it("should parse for and while loops", () => {
    const code = `for (let i = 0; i < 5; i++) {}\nwhile (running) {}`;
    const ast = parseSourceCode(code);

    const forNodes = ast.children!.filter((n) => n.type === "ForStatement");
    const whileNodes = ast.children!.filter((n) => n.type === "WhileStatement");

    assert.equal(forNodes.length, 1);
    assert.equal(forNodes[0].range.start.line, 1);

    assert.equal(whileNodes.length, 1);
    assert.equal(whileNodes[0].range.start.line, 2);
  });

  it("should parse array access MemberExpression", () => {
    const code = `let val = arr[mid];`;
    const ast = parseSourceCode(code);

    const memberNodes = ast.children!.filter((n) => n.type === "MemberExpression");
    assert.equal(memberNodes.length, 1);
  });
});
