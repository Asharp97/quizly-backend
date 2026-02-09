export interface QuizSubmittedEvent {
  quizSubmissionId: string;
  quizId: string;
  userId: string;
  submittedAt: string;
  answerCount: number;
}

export interface QuizScoredEvent {
  quizSubmissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
}
