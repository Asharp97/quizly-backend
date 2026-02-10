import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { QuizSubmission } from 'types/quiz-submission/quiz-submission.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuizSubmissionRepository {
  constructor(private prisma: PrismaService) {}

  getQuizSubmissions(params: {
    where?: Prisma.QuizSubmissionWhereInput;
    orderBy?: Prisma.QuizSubmissionOrderByWithRelationInput;
  }): Promise<QuizSubmission[]> {
    return this.prisma.quizSubmission.findMany(params);
  }

  getQuizSubmissionsCount(params: {
    where?: Prisma.QuizSubmissionWhereInput;
  }): Promise<number> {
    return this.prisma.quizSubmission.count(params);
  }

  getQuizSubmission(id: string): Promise<QuizSubmission | null> {
    return this.prisma.quizSubmission.findUnique({ where: { id } });
  }

  getQuizSubmissionByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<QuizSubmission | null> {
    return this.prisma.quizSubmission.findFirst({
      where: { idempotencyKey },
    });
  }

  deleteQuizSubmission(id: string): Promise<QuizSubmission | null> {
    return this.prisma.quizSubmission.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  updateQuizSubmission(params: {
    where: Prisma.QuizSubmissionWhereUniqueInput;
    data: Prisma.QuizSubmissionUpdateInput;
  }): Promise<QuizSubmission | null> {
    return this.prisma.quizSubmission.update(params);
  }

  createQuizSubmission(
    data: Prisma.QuizSubmissionCreateInput,
  ): Promise<QuizSubmission> {
    return this.prisma.quizSubmission.create({ data });
  }
}
