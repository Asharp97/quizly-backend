import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuestionRepository } from './question.repository';
import { QuestionResolver } from './question.resolver';

@Module({
  providers: [QuestionRepository, QuestionResolver, QuestionService],
  exports: [QuestionService],
  imports: [PrismaModule, ConfigModule],
})
export class QuestionModule {}
