import type { StudentProgress, ReviewItem } from "./types.ts";
import type { ExamTopic } from "../exam/types.ts";

export class ProgressTracker {
  private static STORAGE_KEY = "algovision_student_progress";

  public static getProgress(): StudentProgress {
    if (typeof window === "undefined") {
      return this.getInitialProgress();
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }

    return this.getInitialProgress();
  }

  public static recordAlgorithmView(algoId: string, algoTitle: string): StudentProgress {
    const prog = this.getProgress();
    if (!prog.algorithmsViewed.includes(algoId)) {
      prog.algorithmsViewed.push(algoId);
    }
    if (!prog.completedLessons.includes(algoId)) {
      prog.completedLessons.push(algoId);
    }

    prog.recentActivity.unshift({
      title: `Viewed ${algoTitle}`,
      type: "lesson",
      timestamp: Date.now(),
    });
    prog.recentActivity = prog.recentActivity.slice(0, 10);

    this.saveProgress(prog);
    return prog;
  }

  public static recordPracticeAnswer(algoId: string, isCorrect: boolean): StudentProgress {
    const prog = this.getProgress();
    prog.totalPracticeQuestions++;
    if (isCorrect) prog.correctPracticeQuestions++;

    prog.practiceAccuracy = Math.round((prog.correctPracticeQuestions / prog.totalPracticeQuestions) * 100);

    prog.recentActivity.unshift({
      title: `Practice Mode: ${algoId} (${isCorrect ? "Correct" : "Incorrect"})`,
      type: "practice",
      timestamp: Date.now(),
    });
    prog.recentActivity = prog.recentActivity.slice(0, 10);

    this.saveProgress(prog);
    return prog;
  }

  public static recordExamResult(topic: ExamTopic, percentage: number, weakTopics: string[]): StudentProgress {
    const prog = this.getProgress();
    prog.examScores.push({ topic, percentage, timestamp: Date.now() });

    const currentBest = prog.bestScores[topic] || 0;
    if (percentage > currentBest) {
      prog.bestScores[topic] = percentage;
    }

    weakTopics.forEach((wt) => {
      if (!prog.weakTopics.includes(wt)) {
        prog.weakTopics.push(wt);
      }
    });

    prog.recentActivity.unshift({
      title: `${topic.toUpperCase()} Exam (${percentage}%)`,
      type: "exam",
      timestamp: Date.now(),
    });
    prog.recentActivity = prog.recentActivity.slice(0, 10);

    this.saveProgress(prog);
    return prog;
  }

  public static addReviewItem(item: ReviewItem): StudentProgress {
    const prog = this.getProgress();
    prog.reviewQueue.unshift(item);
    prog.reviewQueue = prog.reviewQueue.slice(0, 20); // Keep max 20 items

    this.saveProgress(prog);
    return prog;
  }

  private static saveProgress(prog: StudentProgress) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prog));
      } catch {
        // Fallback
      }
    }
  }

  private static getInitialProgress(): StudentProgress {
    return {
      algorithmsViewed: ["bubble-sort"],
      practiceAccuracy: 85,
      totalPracticeQuestions: 20,
      correctPracticeQuestions: 17,
      examScores: [{ topic: "sorting", percentage: 90, timestamp: Date.now() - 86400000 }],
      weakTopics: ["Recursion return flow", "Graph BFS queue state"],
      completedLessons: ["bubble-sort", "linear-search"],
      bestScores: { sorting: 90 },
      recentActivity: [
        { title: "Viewed Bubble Sort", type: "lesson", timestamp: Date.now() - 3600000 },
        { title: "Completed Practice Question", type: "practice", timestamp: Date.now() - 7200000 },
      ],
      reviewQueue: [],
    };
  }
}
