import type { ExecutionEventType } from "../../types/execution.ts";

export type ExamQuestionType =
  | "trace_prediction"
  | "runtime_state"
  | "data_structure_state"
  | "code_line"
  | "output"
  | "complexity"
  | "concept"
  | "error_diagnosis"
  | "ordering";

export type ExamTopic =
  | "sorting"
  | "searching"
  | "data-structures"
  | "graphs"
  | "recursion";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface ExamQuestion {
  id: string;
  type: ExamQuestionType;
  topic: ExamTopic;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceStep?: number;
  difficulty: DifficultyLevel;
}

export interface ExamAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export type ExamStatus = "not-started" | "in-progress" | "submitted" | "expired";

export interface ExamSession {
  id: string;
  topic: ExamTopic;
  title: string;
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  startedAt: number;
  durationSeconds: number;
  remainingSeconds: number;
  answers: Record<string, ExamAnswer>;
  status: ExamStatus;
}

export interface TopicScore {
  topic: ExamTopic;
  score: number;
  total: number;
  percentage: number;
}

export interface ExamResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  durationSeconds: number;
  timeSpentSeconds: number;
  topicBreakdown: TopicScore[];
  weakConcepts: string[];
  answers: ExamAnswer[];
  questions: ExamQuestion[];
}
