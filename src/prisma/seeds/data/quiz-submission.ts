import { userIds } from './user';
import { quizIds } from './quiz';
import { v4 as uuid } from 'uuid';

const quiz_submissionsCount = 50;
const quiz_submissions_ids = [
  ...Array.from({ length: quiz_submissionsCount }, () => uuid()),
];

const quiz_submissions = [
  ...Array.from({ length: quiz_submissionsCount }, (_, i) => ({
    id: quiz_submissions_ids[i],
    quizId: quizIds[i % quizIds.length],
    userId: userIds[i % userIds.length],
    score: Math.floor(Math.random() * 101),
    timeTaken: Math.floor(Math.random() * 3600),
    submittedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
  })),
];
export { quiz_submissions_ids, quiz_submissions };
