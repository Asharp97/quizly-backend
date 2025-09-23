import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AnswerSubmission } from 'types/answer-submission/answer-submission.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnswerSubmissionRepository {
  constructor(private prisma: PrismaService) {}

  getAnswerSubmissions(params: {
    where?: Prisma.AnswerSubmissionWhereInput;
    orderBy?: Prisma.AnswerSubmissionOrderByWithRelationInput;
  }): Promise<AnswerSubmission[]> {
    return this.prisma.answerSubmission.findMany(params);
  }

  getAnswerSubmission(id: string): Promise<AnswerSubmission | null> {
    return this.prisma.answerSubmission.findUnique({ where: { id } });
  }

  deleteAnswerSubmission(id: string): Promise<AnswerSubmission | null> {
    return this.prisma.answerSubmission.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  updateAnswerSubmission(params: {
    where: Prisma.AnswerSubmissionWhereUniqueInput;
    data: Prisma.AnswerSubmissionUpdateInput;
  }): Promise<AnswerSubmission | null> {
    return this.prisma.answerSubmission.update(params);
  }

  createAnswerSubmission(
    data: Prisma.AnswerSubmissionCreateInput,
  ): Promise<AnswerSubmission> {
    return this.prisma.answerSubmission.create({ data });
  }
}
