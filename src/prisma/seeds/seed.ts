import { users } from './data/user';
import { quizzes } from './data/quiz';
import { PrismaClient } from '@prisma/client';
import { questions } from './data/questions';
import { answers } from './data/answers';
import { genLink } from '../../common/utils/genLink';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  await prisma.quiz.createMany({
    data: quizzes.map((quiz) => ({
      ...quiz,
      link: genLink(),
    })),
    skipDuplicates: true,
  });
  await prisma.question.createMany({
    data: questions,
    skipDuplicates: true,
  });
  await prisma.answer.createMany({
    data: answers,
    skipDuplicates: true,
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
