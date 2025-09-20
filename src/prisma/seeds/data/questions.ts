import { quizId } from './quiz';
import { question_type } from '@prisma/client';
const questionId = [
  '84f2dca2-65c8-4316-ab7a-6fdf0d8794ca',
  'e4ca82ce-fc3f-4067-9255-8ec161bce511',
  '0eb1007e-cab5-4b7f-9cf2-5b85bdfdd78c',
  '6db73a31-d43a-4ca1-a4b3-506c93f9576c',
  '96ffb36c-6a11-444b-ae7a-29c8d5f6c280',
];

const questions = [
  {
    id: questionId[0],
    text: 'What is the chemical symbol for water?',
    type: question_type.MULTIPLE_CHOICE,
    quizId: quizId[0],
  },
  {
    id: questionId[3],
    text: 'What is the chemical symbol for Baron?',
    type: question_type.MULTIPLE_CHOICE,
    quizId: quizId[0],
  },
  {
    id: questionId[4],
    text: 'What is the chemical symbol for Zinc?',
    type: question_type.MULTIPLE_CHOICE,
    quizId: quizId[0],
  },

  {
    id: questionId[1],
    text: 'What is the speed of light in a vacuum?',
    type: question_type.SHORT_ANSWER,
    quizId: quizId[1],
  },
  {
    id: questionId[2],
    text: 'Is the Earth flat?',
    type: question_type.TRUE_FALSE,
    trueFalseAnswer: false,
    quizId: quizId[2],
  },
];

export { questionId, questions };
