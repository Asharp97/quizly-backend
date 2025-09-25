import { v4 as uuid } from 'uuid';
import { quizIds } from './quiz';
import { question_type } from '@prisma/client';

const questionCount = 30;
const questionIds = [...Array.from({ length: questionCount }, () => uuid())];

const questions = [
  {
    id: questionIds[0],
    text: 'What is the chemical symbol for water?',
    type: question_type.MULTIPLE_CHOICE,
    quizId: quizIds[0],
  },
  {
    id: questionIds[1],
    text: 'What is the chemical symbol for Baron?',
    type: question_type.MULTIPLE_CHOICE,
    quizId: quizIds[0],
  },
  {
    id: questionIds[2],
    text: 'What is the chemical symbol for Zinc?',
    type: question_type.MULTIPLE_CHOICE,
    quizId: quizIds[0],
  },
  {
    id: questionIds[3],
    text: 'What is the speed of light in a vacuum?',
    type: question_type.SHORT_ANSWER,
    quizId: quizIds[1],
  },
  {
    id: questionIds[4],
    text: 'Is the Earth flat?',
    type: question_type.TRUE_FALSE,
    trueFalseAnswer: false,
    quizId: quizIds[2],
  },
  ...Array.from({ length: questionCount - 5 }, (_, i) => ({
    id: questionIds[i + 5],
    text: `Auto-generated question ${Math.floor(Math.random() * 10000)}`,
    type: Object.values(question_type)[
      Math.floor(Math.random() * Object.values(question_type).length)
    ],
    quizId: quizIds[((i + 3) % (quizIds.length - 3)) + 3],
  })),
];

export { questionIds, questions };
