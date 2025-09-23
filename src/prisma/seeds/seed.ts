import { users } from './data/user';
import { quizzes } from './data/quiz';
import { PrismaClient } from '@prisma/client';
import { questions } from './data/questions';
import { answers } from './data/answers';
import { answer_submissions } from './data/answer-submission';
import { quiz_submissions } from './data/quiz-submission';
import { genLink } from '../../common/utils/genLink';

const prisma = new PrismaClient();
const skipDuplicates = true;

async function main() {
  await prisma.user.createMany({
    data: users,
    skipDuplicates,
  });

  await prisma.quiz.createMany({
    data: quizzes.map((quiz) => ({
      ...quiz,
      link: genLink(),
    })),
    skipDuplicates,
  });
  await prisma.question.createMany({
    data: questions,
    skipDuplicates,
  });
  await prisma.answer.createMany({
    data: answers,
    skipDuplicates,
  });
  await prisma.quizSubmission.createMany({
    data: quiz_submissions,
    skipDuplicates,
  });
  await prisma.answerSubmission.createMany({
    data: answer_submissions,
    skipDuplicates,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
