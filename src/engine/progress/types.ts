import type { ExamTopic } from "../exam/types.ts";

export interface ReviewItem {
  id: string;
  topic: ExamTopic;
  algorithmId: string;
  questionPrompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  sourceStep?: number;
  recordedAt: number;
}

export interface StudentProgress {
  algorithmsViewed: string[];
  practiceAccuracy: number;
  totalPracticeQuestions: number;
  correctPracticeQuestions: number;
  examScores: { topic: ExamTopic; percentage: number; timestamp: number }[];
  weakTopics: string[];
  completedLessons: string[];
  bestScores: Record<string, number>;
  recentActivity: { title: string; type: "lesson" | "practice" | "exam"; timestamp: number }[];
  reviewQueue: ReviewItem[];
}
