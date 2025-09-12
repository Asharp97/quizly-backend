import { Prisma } from '@prisma/client';
import { Quiz } from 'types/quiz/quiz.model';
import { QuizRepository } from './quiz.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizService {
  constructor(private repo: QuizRepository) {}
  async getQuizzes(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuizWhereInput;
    orderBy?: Prisma.QuizOrderByWithRelationInput;
  }): Promise<Quiz[]> {
    return await this.repo.getQuizzes(params);
  }

  async getQuiz(id: string): Promise<Quiz | null> {
    return await this.repo.getQuiz(id);
  }

  async deleteQuiz(id: string): Promise<Quiz | null> {
    return await this.repo.deleteQuiz(id);
  }

  async updateQuiz(
    id: string,
    data: Prisma.QuizUpdateInput,
  ): Promise<Quiz | null> {
    return await this.repo.updateQuiz({ where: { id }, data });
  }

  async createQuiz(data: Prisma.QuizUncheckedCreateInput): Promise<Quiz> {
    data.link = Math.random().toString(36).substring(2, 8).toLowerCase();
    const quiz = await this.repo.createQuiz(data);
    return quiz;
  }
}
