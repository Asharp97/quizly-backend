import { Module } from '@nestjs/common';
import { QuizResolver } from './quiz.resolver';
import { QuizService } from './quiz.service';
import { QuizRepository } from './quiz.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [QuizRepository, QuizResolver, QuizService],
  exports: [QuizService],
  imports: [PrismaModule, ConfigModule, UserModule],
})
export class QuizModule {}
