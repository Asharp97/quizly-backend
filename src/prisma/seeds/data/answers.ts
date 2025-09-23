import { questionIds } from './questions';
import { v4 as uuid } from 'uuid';

const answerCount = 50;
const answerIds = [...Array.from({ length: answerCount }, () => uuid())];

const sampleAnswers = [
  { text: 'H2O', isCorrect: true },
  { text: 'CO2', isCorrect: false },
  { text: 'O2', isCorrect: false },
  { text: 'Br', isCorrect: false },
  { text: 'He', isCorrect: false },
  { text: 'B', isCorrect: true },
  { text: 'Ba', isCorrect: false },
  { text: 'H', isCorrect: false },
  { text: 'Zn', isCorrect: true },
];

const answers = [
  // Sample answers for first few questions
  ...sampleAnswers.map((ans, i) => ({
    ...ans,
    questionId: questionIds[i % questionIds.length],
    id: answerIds[i],
  })),
  // Auto-generated answers for all questions
  ...Array.from({ length: answerCount - sampleAnswers.length }, (_, i) => ({
    id: answerIds[i + sampleAnswers.length],
    text: `Auto-answer ${Math.floor(Math.random() * 10000)}`,
    isCorrect: Math.random() < 0.25,
    questionId: questionIds[i % questionIds.length],
  })),
];
export { answerIds, answers };
