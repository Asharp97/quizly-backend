import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';
import { KafkaHealthController } from './kafka.controller';
import { QuizScoringService } from '../quiz-submission/quiz-scoring.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KafkaHealthController],
  providers: [ProducerService, ConsumerService, QuizScoringService],
  exports: [ProducerService, ConsumerService, QuizScoringService],
})
export class KafkaModule {}
