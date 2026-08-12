import type { ExamSession, ExamTopic, ExamResult, ExamAnswer, TopicScore } from "./types.ts";
import { QuestionGenerator } from "./QuestionGenerator.ts";

export class ExamEngine {
  public static createSession(topic: ExamTopic, durationSeconds: number = 300): ExamSession {
    const questions = QuestionGenerator.generateQuestionsForTopic(topic, 5);
    const title = `${topic.toUpperCase()} Competency Exam`;

    return {
      id: `session-${Date.now()}`,
      topic,
      title,
      questions,
      currentQuestionIndex: 0,
      startedAt: Date.now(),
      durationSeconds,
      remainingSeconds: durationSeconds,
      answers: {},
      status: "in-progress",
    };
  }

  public static submitAnswer(session: ExamSession, questionId: string, userAnswer: string): ExamSession {
    if (session.status !== "in-progress") return session;

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) return session;

    const isCorrect = question.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();

    const answerRecord: ExamAnswer = {
      questionId,
      userAnswer,
      isCorrect,
      timeSpentSeconds: 10,
    };

    const updatedAnswers = { ...session.answers, [questionId]: answerRecord };

    return {
      ...session,
      answers: updatedAnswers,
    };
  }

  public static evaluateResult(session: ExamSession): ExamResult {
    const totalQuestions = session.questions.length;
    let correctCount = 0;
    const weakConcepts: string[] = [];

    const answersList: ExamAnswer[] = [];

    session.questions.forEach((q) => {
      const ans = session.answers[q.id];
      if (ans && ans.isCorrect) {
        correctCount++;
        answersList.push(ans);
      } else {
        const dummyAnswer: ExamAnswer = ans || {
          questionId: q.id,
          userAnswer: "Unanswered",
          isCorrect: false,
          timeSpentSeconds: 0,
        };
        answersList.push(dummyAnswer);

        if (!weakConcepts.includes(q.type)) {
          weakConcepts.push(`${q.topic} - ${q.type.replace("_", " ")}`);
        }
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const topicBreakdown: TopicScore[] = [
      {
        topic: session.topic,
        score: correctCount,
        total: totalQuestions,
        percentage,
      },
    ];

    return {
      sessionId: session.id,
      score: correctCount,
      totalQuestions,
      percentage,
      durationSeconds: session.durationSeconds,
      timeSpentSeconds: Math.max(0, session.durationSeconds - session.remainingSeconds),
      topicBreakdown,
      weakConcepts,
      answers: answersList,
      questions: session.questions,
    };
  }
}
