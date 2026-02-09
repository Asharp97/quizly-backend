import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProducerService } from '../kafka/producer.service';
import {
  QuizScoredEvent,
  QuizSubmittedEvent,
} from '../kafka/events/quiz-submission.event';

@Injectable()
export class QuizScoringService {
  private readonly logger = new Logger(QuizScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly producerService: ProducerService,
  ) {}

  async processQuizSubmission(event: QuizSubmittedEvent): Promise<void> {
    this.logger.log(
      `Processing quiz submission: ${event.quizSubmissionId} for quiz ${event.quizId}`,
    );

    try {
      // Fetch the submission with all answer submissions
      const submission = await this.prisma.quizSubmission.findUnique({
        where: { id: event.quizSubmissionId },
        include: {
          AnswerSubmission: {
            include: {
              Question: {
                include: {
                  answer: true,
                },
              },
              Answer: true,
            },
          },
          Quiz: {
            include: {
              Question: true,
            },
          },
        },
      });

      if (!submission) {
        this.logger.error(
          `Quiz submission not found: ${event.quizSubmissionId}`,
        );
        return;
      }

      // Calculate score
      let totalScore = 0;
      let maxScore = 0;

      for (const answerSubmission of submission.AnswerSubmission) {
        const question = answerSubmission.Question;
        maxScore += question.points;

        // Check if answer is correct based on question type
        let isCorrect = false;

        switch (question.type) {
          case 'MULTIPLE_CHOICE':
            // For multiple choice, check if the selected answer is correct
            if (answerSubmission.Answer && answerSubmission.Answer.isCorrect) {
              isCorrect = true;
            }
            break;

          case 'TRUE_FALSE':
            // For true/false, compare the selected answer with the correct answer
            if (answerSubmission.Answer && answerSubmission.Answer.isCorrect) {
              isCorrect = true;
            }
            break;

          case 'SHORT_ANSWER':
            // For short answer, compare text (case-insensitive trim)
            if (
              answerSubmission.text &&
              question.shortAnswer &&
              answerSubmission.text.trim().toLowerCase() ===
                question.shortAnswer.trim().toLowerCase()
            ) {
              isCorrect = true;
            }
            break;
        }

        if (isCorrect) {
          totalScore += question.points;
        }
      }

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      // Update the submission with the calculated score
      await this.prisma.quizSubmission.update({
        where: { id: event.quizSubmissionId },
        data: {
          score: percentage,
          submittedAt: new Date(event.submittedAt),
        },
      });

      this.logger.log(
        `Quiz submission scored: ${event.quizSubmissionId} - ${percentage.toFixed(2)}% (${totalScore}/${maxScore} points)`,
      );

      // Emit quiz scored event
      const scoredEvent: QuizScoredEvent = {
        quizSubmissionId: event.quizSubmissionId,
        score: totalScore,
        maxScore,
        percentage,
      };

      await this.producerService.produce({
        topic: 'quiz.scored',
        messages: [
          {
            key: event.quizSubmissionId,
            value: JSON.stringify(scoredEvent),
          },
        ],
      });

      this.logger.log(
        `Quiz scored event emitted for: ${event.quizSubmissionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing quiz submission ${event.quizSubmissionId}:`,
        error,
      );
      throw error;
    }
  }
}
