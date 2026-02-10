import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from 'src/question/question.service';
import { QuestionModule } from 'src/question/question.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnswerModule } from 'src/answer/answer.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { QuestionUncheckedCreateInput } from 'types/question/question-unchecked-create.input';

// Helper to create a test user and return its id
async function createTestUser(prisma: PrismaService): Promise<string> {
  const user = await prisma.user.create({
    data: {
      email: 'question.integration@test.com',
      password: 'password123',
    },
  });
  return user.id;
}

// Helper to create a test quiz and return its id
async function createTestQuiz(
  prisma: PrismaService,
  userId: string,
): Promise<string> {
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Integration Test Quiz',
      link: 'integration-test-link',
      description: 'Quiz for question integration',
      User: { connect: { id: userId } },
    },
  });
  return quiz.id;
}

describe('QuestionService Integration', () => {
  let service: QuestionService;
  let prisma: PrismaService;
  let testQuestionId: string;
  let testQuizId: string;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        QuestionModule,
        AnswerModule,
        JwtModule.register({
          secret: process.env.API_JWT_SECRET || 'test_secret',
          signOptions: { issuer: process.env.API_JWT_ISSUER || 'test_issuer' },
        }),
        RedisModule.forRoot({}),
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    prisma = module.get<PrismaService>(PrismaService);
    testUserId = await createTestUser(prisma);
    testQuizId = await createTestQuiz(prisma, testUserId);
  });

  afterAll(async () => {
    // Clean up test question, quiz, and user
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

  it('should create and fetch a question', async () => {
    const questionData = {
      quizId: testQuizId,
      text: 'Integration Test Question',
      type: 'MULTIPLE_CHOICE',
      points: 5,
    };
    const createdQuestion = await service.createQuestion(
      questionData as QuestionUncheckedCreateInput,
    );
    expect(createdQuestion.text).toBe('Integration Test Question');
    testQuestionId = createdQuestion.id;

    const fetchedQuestion = await service.getQuestion(testQuestionId);
    expect(fetchedQuestion).not.toBeNull();
    expect(fetchedQuestion?.text).toBe('Integration Test Question');
  });
});
