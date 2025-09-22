import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

describe('UserService Integration', () => {
  let service: UserService;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        UserModule,
        JwtModule.register({
          secret: process.env.API_JWT_SECRET || 'test_secret',
          signOptions: { issuer: process.env.API_JWT_ISSUER || 'test_issuer' },
        }),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
    // await prisma.$disconnect();
  });

  it('should create and fetch a user', async () => {
    const userData = { email: 'integration@test.com', password: 'password123' };
    const signupResult = await service.signUp(userData);
    expect(signupResult.user.email).toBe('integration@test.com');
    testUserId = signupResult.user.id;

    const fetchedUser = await service.getUser(testUserId);
    expect(fetchedUser).not.toBeNull();
    expect(fetchedUser?.email).toBe('integration@test.com');
  });
});
