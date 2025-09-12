import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnswerRepository } from './answer.repository';
import { AnswerResolver } from './answer.resolver';

@Module({
  providers: [AnswerRepository, AnswerResolver, AnswerService],
  exports: [AnswerService],
  imports: [PrismaModule, ConfigModule],
})
export class AnswerModule {}
