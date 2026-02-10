import { Prisma } from '@prisma/client';
import { QuizSubmission } from 'types/quiz-submission/quiz-submission.model';
import { QuizSubmissionRepository } from './quiz-submission.repository';
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ProducerService } from 'src/kafka/producer.service';
import { QuizSubmittedEvent } from 'src/kafka/events/quiz-submission.event';

@Injectable()
export class QuizSubmissionService {
  private readonly logger = new Logger(QuizSubmissionService.name);

  constructor(
    private repo: QuizSubmissionRepository,
    private userService: UserService,
    private producerService: ProducerService,
  ) {}
  async getQuizSubmissions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuizSubmissionWhereInput;
    orderBy?: Prisma.QuizSubmissionOrderByWithRelationInput;
  }): Promise<QuizSubmission[]> {
    return await this.repo.getQuizSubmissions(params);
  }

  async getQuizSubmissionsCount(params: {
    where?: Prisma.QuizSubmissionWhereInput;
  }): Promise<number> {
    return await this.repo.getQuizSubmissionsCount(params);
  }

  async getQuizSubmission(id: string): Promise<QuizSubmission | null> {
    return await this.repo.getQuizSubmission(id);
  }

  async getQuizSubmissionByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<QuizSubmission | null> {
    return await this.repo.getQuizSubmissionByIdempotencyKey(idempotencyKey);
  }

  async deleteQuizSubmission(id: string): Promise<QuizSubmission | null> {
    return await this.repo.deleteQuizSubmission(id);
  }

  async updateQuizSubmission(
    id: string,
    data: Prisma.QuizSubmissionUpdateInput,
  ): Promise<QuizSubmission | null> {
    return await this.repo.updateQuizSubmission({ where: { id }, data });
  }

  async createQuizSubmission(
    data: Prisma.QuizSubmissionCreateInput,
    token: string,
    idempotencyKey?: string,
  ): Promise<QuizSubmission> {
    const userId = this.userService.getUserIdFromToken(token);
    if (!userId) {
      throw new Error('Invalid token');
    }

    const payload = {
      ...data,
      User: { connect: { id: userId } },
      idempotencyKey: idempotencyKey ?? undefined,
    };

    const quizSubmission = await this.repo.createQuizSubmission(payload);

    // Emit quiz submission event to Kafka for async processing
    try {
      let quizId = '';

      if (typeof data.Quiz === 'object' && data.Quiz) {
        if ('connect' in data.Quiz && data.Quiz.connect?.id) {
          quizId = data.Quiz.connect.id;
        }
      }

      const event: QuizSubmittedEvent = {
        quizSubmissionId: quizSubmission.id,
        quizId,
        userId,
        submittedAt: new Date().toISOString(),
        answerCount: quizSubmission.AnswerSubmission?.length || 0,
      };

      await this.producerService.produce({
        topic: 'quiz.submitted',
        messages: [
          {
            key: quizSubmission.id,
            value: JSON.stringify(event),
          },
        ],
      });

      this.logger.log(`Quiz submission event emitted: ${quizSubmission.id}`);
    } catch (error) {
      // Log error but don't fail the submission
      this.logger.error('Failed to emit quiz submission event:', error);
    }

    return quizSubmission;
  }
}
