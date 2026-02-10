import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from 'src/quiz/quiz.service';
import { QuizModule } from 'src/quiz/quiz.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { UserService } from 'src/user/user.service';
import { QuizCreateInput } from 'types/quiz/quiz-create.input';

// Helper to create a test user and get a valid token
async function createTestUser(prisma: PrismaService, userService: any) {
  const userData = {
    email: 'quiz.integration@test.com',
    password: 'password123',
  };
  const signupResult = await userService.signUp(userData);
  return { userId: signupResult.user.id, token: signupResult.accessToken };
}

describe('QuizService Integration', () => {
  let service: QuizService;
  let prisma: PrismaService;
  let testQuizId: string;
  let testUser: { userId: string; token: string };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        QuizModule,
        UserModule,
        JwtModule.register({
          secret: process.env.API_JWT_SECRET || 'test_secret',
          signOptions: { issuer: process.env.API_JWT_ISSUER || 'test_issuer' },
        }),
        RedisModule.forRoot({}),
        CacheModule.register({ isGlobal: true, ttl: 300 }),
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    prisma = module.get<PrismaService>(PrismaService);
    const userService = module.get<UserService>(UserService);
    testUser = await createTestUser(prisma, userService);
  });

  afterAll(async () => {
    // Clean up test data in reverse order of dependencies
    try {
      if (testQuizId) {
        await prisma.quiz.deleteMany({ where: { id: testQuizId } });
      }
      if (testUser?.userId) {
        await prisma.user.deleteMany({ where: { id: testUser.userId } });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  it('should create and fetch a quiz', async () => {
    const quizData = {
      title: 'Integration Test Quiz',
      description: 'A quiz for integration testing',
      // other required fields can be added here
    };
    const createdQuiz = await service.createQuiz(
      quizData as QuizCreateInput,
      testUser.token,
    );
    expect(createdQuiz.title).toBe('Integration Test Quiz');
    testQuizId = createdQuiz.id;

    const fetchedQuiz = await service.getQuiz({ where: { id: testQuizId } });
    expect(fetchedQuiz).not.toBeNull();
    expect(fetchedQuiz?.title).toBe('Integration Test Quiz');
  });
});
