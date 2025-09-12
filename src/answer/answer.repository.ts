import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Answer } from 'types/answer/answer.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnswerRepository {
  constructor(private prisma: PrismaService) {}

  getAnswers(params: {
    where?: Prisma.AnswerWhereInput;
    orderBy?: Prisma.AnswerOrderByWithRelationInput;
  }): Promise<Answer[]> {
    return this.prisma.answer.findMany(params);
  }

  getAnswer(id: string): Promise<Answer | null> {
    return this.prisma.answer.findUnique({ where: { id } });
  }

  deleteAnswer(id: string): Promise<Answer | null> {
    return this.prisma.answer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  updateAnswer(params: {
    where: Prisma.AnswerWhereUniqueInput;
    data: Prisma.AnswerUpdateInput;
  }): Promise<Answer | null> {
    return this.prisma.answer.update(params);
  }

  createAnswer(data: Prisma.AnswerUncheckedCreateInput): Promise<Answer> {
    return this.prisma.answer.create({ data });
  }
}
