import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer.service';
import { QuizSubmittedEvent } from 'src/kafka/events/quiz-submission.event';
import { QuizScoringService } from 'src/quiz-submission/quiz-scoring.service';

// src/quiz-submission/quiz-submitted.consumer.ts
@Injectable()
export class QuizSubmittedConsumer implements OnApplicationBootstrap {
  constructor(
    private consumerService: ConsumerService,
    private quizScoringService: QuizScoringService,
  ) {}

  async onApplicationBootstrap() {
    await this.consumerService.consume(
      { topics: ['quiz.submitted'] },
      {
        eachMessage: async ({ message }) => {
          const event: QuizSubmittedEvent = JSON.parse(
            message.value?.toString() || '{}',
          );
          await this.quizScoringService.processQuizSubmission(event);
        },
      },
    );
  }
}
