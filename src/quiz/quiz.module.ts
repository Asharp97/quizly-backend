import { Module } from '@nestjs/common';
import { QuizResolver } from './quiz.resolver';
import { QuizService } from './quiz.service';
import { QuizRepository } from './quiz.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [QuizRepository, QuizResolver, QuizService],
  exports: [QuizService],
  imports: [
    PrismaModule,
    ConfigModule,
    UserModule,
    RedisModule.forRoot({
      config: {
        host: process.env.API_REDIS_HOST || 'localhost',
        port: parseInt(process.env.API_REDIS_PORT || '6379', 10),
        username: process.env.API_REDIS_USERNAME,
        password: process.env.API_REDIS_PASSWORD,
      },
    }),
    JwtModule.register({
      secret: process.env.API_JWT_SECRET || 'test_secret',
      signOptions: { issuer: process.env.API_JWT_ISSUER || 'test_issuer' },
    }),
  ],
})
export class QuizModule {}
