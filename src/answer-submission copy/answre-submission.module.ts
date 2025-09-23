import { Module } from '@nestjs/common';
import { AnswerSubmissionService } from './answer-submission.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnswerSubmissionRepository } from './answer-submission.repository';
import { AnswerSubmissionResolver } from './answer-submission.resolver';

@Module({
  providers: [
    AnswerSubmissionRepository,
    AnswerSubmissionResolver,
    AnswerSubmissionService,
  ],
  exports: [AnswerSubmissionService],
  imports: [PrismaModule, ConfigModule],
})
export class AnswerSubmissionModule {}
