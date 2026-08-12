import type { ExecutionEventType } from "../../types/execution.ts";

export interface SourceLocation {
  line: number;
  column: number;
}

export interface SourceRange {
  start: SourceLocation;
  end: SourceLocation;
}

export type ASTNodeType =
  | "Program"
  | "FunctionDeclaration"
  | "FunctionExpression"
  | "ArrowFunctionExpression"
  | "Identifier"
  | "Literal"
  | "VariableDeclaration"
  | "VariableDeclarator"
  | "AssignmentExpression"
  | "ReturnStatement"
  | "IfStatement"
  | "ForStatement"
  | "WhileStatement"
  | "CallExpression"
  | "BinaryExpression"
  | "UnaryExpression"
  | "MemberExpression"
  | "ArrayExpression"
  | "BlockStatement"
  | "ExpressionStatement"
  | "UnsupportedNode";

export interface ASTNode {
  id: string;
  type: ASTNodeType;
  name?: string;
  range: SourceRange;
  children?: ASTNode[];
  raw?: string;
  metadata?: Record<string, unknown>;
}

export interface FunctionInfo {
  name: string;
  params: string[];
  startLine: number;
  endLine: number;
  isRecursive: boolean;
  returns: number[];
  range: SourceRange;
}

export interface VariableInfo {
  name: string;
  kind: "var" | "let" | "const" | "parameter";
  line: number;
}

export interface LoopInfo {
  type: "for" | "while" | "do-while";
  line: number;
  range: SourceRange;
}

export interface FunctionCallInfo {
  callee: string;
  args: string[];
  line: number;
  isRecursiveCall: boolean;
  range: SourceRange;
}

export interface RecursionInfo {
  isRecursive: boolean;
  recursiveFunctions: string[];
  recursiveCallLines: number[];
}

export interface ProgramAnalysis {
  functions: FunctionInfo[];
  variables: VariableInfo[];
  loops: LoopInfo[];
  calls: FunctionCallInfo[];
  recursion: RecursionInfo;
  unsupportedConstructs: string[];
  isValid: boolean;
  validationMessage?: string;
  patternMetadata?: {
    detectedPattern?: string; // e.g. "Factorial", "Fibonacci", "Bubble Sort", "Binary Search", "Linear Search"
  };
}

export interface InstrumentationPoint {
  id: string;
  line: number;
  eventType: ExecutionEventType;
  sourceNodeId: string;
  description: string;
}
