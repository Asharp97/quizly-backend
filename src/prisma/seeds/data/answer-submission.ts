import { quiz_submissions_ids } from './quiz-submission';
import { v4 as uuid } from 'uuid';
import { questionIds } from './questions';
import { answerIds } from './answers';

const answer_submissionsCount = 100;
const answer_submissions_ids = [
  ...Array.from({ length: answer_submissionsCount }, () => uuid()),
];

const answer_submissions = [
  ...Array.from({ length: answer_submissionsCount }, (_, i) => ({
    id: answer_submissions_ids[i],
    submittedQuizId: quiz_submissions_ids[i % quiz_submissions_ids.length],
    questionId: questionIds[i % questionIds.length],
    answerId: answerIds[i % answerIds.length],
  })),
];
export { answer_submissions_ids, answer_submissions };
