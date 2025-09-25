import { v4 as uuid } from 'uuid';
import { userIds } from './user';

const quizCount = 5;
const quizIds = [...Array.from({ length: quizCount }, () => uuid())];

const quizzes = [
  {
    id: quizIds[0],
    title: 'Chemistry 101',
    description: 'This is a sample quiz description.',
    userId: userIds[0],
  },
  {
    id: quizIds[1],
    title: 'Physics 101',
    description: 'This is another sample quiz description.',
    timeLimit: 45,
    userId: userIds[0],
  },
  {
    id: quizIds[2],
    title: 'Math 101',
    description: 'This is yet another sample quiz description.',
    userId: userIds[0],
  },
  ...Array.from({ length: quizCount - 3 }, (_, i) => ({
    id: quizIds[i + 3],
    title: `Quiz ${Math.floor(Math.random() * 10000)}`,
    description: 'Auto-generated quiz description.',
    // userId: userIds[(i + 3) % userIds.length],
    userId: userIds[0],
  })),
];

export { quizIds, quizzes };
