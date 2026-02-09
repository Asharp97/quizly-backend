import { Module } from '@nestjs/common';
import { QuizSubmissionService } from './quiz-submission.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuizSubmissionRepository } from './quiz-submission.repository';
import { QuizSubmissionResolver } from './quiz-submission.resolver';
import { UserModule } from 'src/user/user.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  providers: [
    QuizSubmissionRepository,
    QuizSubmissionResolver,
    QuizSubmissionService,
  ],
  exports: [QuizSubmissionService],
  imports: [PrismaModule, ConfigModule, UserModule, KafkaModule],
})
export class QuizSubmissionModule {}
