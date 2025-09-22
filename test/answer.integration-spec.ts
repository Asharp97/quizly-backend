import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from 'src/answer/answer.service';
import { AnswerModule } from 'src/answer/answer.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { QuestionModule } from 'src/question/question.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

// Helper to create a test quiz and return its id
function generateUniqueLink() {
  return `integration-test-link-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function createTestQuiz(
  prisma: PrismaService,
  userId: string,
): Promise<string> {
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Integration Test Quiz',
      link: generateUniqueLink(),
      description: 'Quiz for answer integration',
      User: { connect: { id: userId } },
    },
  });
  return quiz.id;
}
// ...existing code...

// Helper to create a test question and return its id
async function createTestQuestion(
  prisma: PrismaService,
  quizId: string,
): Promise<string> {
  const question = await prisma.question.create({
    data: {
      quizId,
      text: 'Integration Test Question',
      type: 'MULTIPLE_CHOICE',
      points: 5,
    },
  });
  return question.id;
}

describe('AnswerService Integration', () => {
  let service: AnswerService;
  let prisma: PrismaService;
  let testAnswerId: string;
  let testQuestionId: string;
  let testQuizId: string;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        AnswerModule,
        QuestionModule,
        JwtModule.register({
          secret: process.env.API_JWT_SECRET || 'test_secret',
          signOptions: { issuer: process.env.API_JWT_ISSUER || 'test_issuer' },
        }),
        RedisModule.forRoot({}),
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
    prisma = module.get<PrismaService>(PrismaService);
    // Helper to create a test user and return its id
    async function createTestUser(prisma: PrismaService): Promise<string> {
      const user = await prisma.user.create({
        data: {
          email: 'answer.integration@test.com',
          password: 'password123',
        },
      });
      return user.id;
    }
    testUserId = await createTestUser(prisma);
    testQuizId = await createTestQuiz(prisma, testUserId);
    testQuestionId = await createTestQuestion(prisma, testQuizId);
  });

  afterAll(async () => {
    // Clean up test answer, question, quiz, and user
    if (testAnswerId) {
      await prisma.answer.delete({ where: { id: testAnswerId } });
    }
    if (testQuestionId) {
      await prisma.question.delete({ where: { id: testQuestionId } });
    }
    if (testQuizId) {
      await prisma.quiz.delete({ where: { id: testQuizId } });
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
    // await prisma.$disconnect();
  });

  it('should create and fetch an answer', async () => {
    const answerData = {
      text: 'Integration Test Answer',
      isCorrect: true,
      Question: { connect: { id: testQuestionId } },
    };
    const createdAnswer = await service.createAnswer(answerData);
    expect(createdAnswer.text).toBe('Integration Test Answer');
    testAnswerId = createdAnswer.id;

    const fetchedAnswer = await service.getAnswer(testAnswerId);
    expect(fetchedAnswer).not.toBeNull();
    expect(fetchedAnswer?.text).toBe('Integration Test Answer');
  });
});
