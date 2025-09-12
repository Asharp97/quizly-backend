import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Question } from 'types/question/question.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionRepository {
  constructor(private prisma: PrismaService) {}

  getQuestions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuestionWhereInput;
    orderBy?: Prisma.QuestionOrderByWithRelationInput;
  }): Promise<Question[]> {
    return this.prisma.question.findMany(params);
  }

  getQuestion(id: string): Promise<Question | null> {
    return this.prisma.question.findUnique({ where: { id } });
  }

  deleteQuestion(id: string): Promise<Question | null> {
    return this.prisma.question.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  updateQuestion(params: {
    where: Prisma.QuestionWhereUniqueInput;
    data: Prisma.QuestionUpdateInput;
  }): Promise<Question | null> {
    return this.prisma.question.update(params);
  }

  createQuestion(data: Prisma.QuestionUncheckedCreateInput): Promise<Question> {
    return this.prisma.question.create({ data });
  }
}
