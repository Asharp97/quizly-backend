import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Quiz } from 'types/quiz/quiz.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuizRepository {
  constructor(private prisma: PrismaService) {}

  getQuizzes(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuizWhereInput;
    orderBy?: Prisma.QuizOrderByWithRelationInput;
  }): Promise<Quiz[]> {
    return this.prisma.quiz.findMany(params);
  }

  getQuiz(id: string): Promise<Quiz | null> {
    return this.prisma.quiz.findUnique({ where: { id } });
  }

  deleteQuiz(id: string): Promise<Quiz | null> {
    return this.prisma.quiz.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  updateQuiz(params: {
    where: Prisma.QuizWhereUniqueInput;
    data: Prisma.QuizUpdateInput;
  }): Promise<Quiz | null> {
    return this.prisma.quiz.update(params);
  }

  createQuiz(data: Prisma.QuizUncheckedCreateInput): Promise<Quiz> {
    return this.prisma.quiz.create({ data });
  }
}
