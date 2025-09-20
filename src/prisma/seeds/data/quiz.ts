import { userId } from './user';
const quizId = [
  '84f2dca2-65c8-4316-ab7a-6fdf0d8794ca',
  'a17759a1-0e6e-49c7-805f-ff3b8cbed49b',
  '776c20f3-5f38-422c-8516-7a1564143ccb',
];

const quizzes = [
  {
    id: quizId[0],
    title: 'Chemistry 101',
    description: 'This is a sample quiz description.',
    userId,
  },
  {
    id: quizId[1],
    title: 'Physics 101',
    description: 'This is another sample quiz description.',
    timeLimit: 45,
    userId,
  },
  {
    id: quizId[2],
    title: 'Math 101',
    description: 'This is yet another sample quiz description.',
    userId,
  },
];

export { quizId, quizzes };
