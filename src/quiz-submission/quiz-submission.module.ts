import { Module } from '@nestjs/common';
import { QuizSubmissionService } from './quiz-submission.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuizSubmissionRepository } from './quiz-submission.repository';
import { QuizSubmissionResolver } from './quiz-submission.resolver';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [
    QuizSubmissionRepository,
    QuizSubmissionResolver,
    QuizSubmissionService,
  ],
  exports: [QuizSubmissionService],
  imports: [PrismaModule, ConfigModule, UserModule],
})
export class QuizSubmissionModule {}
