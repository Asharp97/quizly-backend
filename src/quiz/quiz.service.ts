import { Prisma } from '@prisma/client';
import { Quiz } from 'types/quiz/quiz.model';
import { QuizRepository } from './quiz.repository';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { genLink } from 'src/common/utils/genLink';

@Injectable()
export class QuizService {
  constructor(
    private repo: QuizRepository,
    private userService: UserService,
  ) {}
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

  async createQuiz(data: Prisma.QuizCreateInput, token: string): Promise<Quiz> {
    const userId = this.userService.getUserIdFromToken(token);
    if (!userId) {
      throw new Error('Invalid token');
    }
    data.link = genLink();

    const payload = {
      ...data,
      User: { connect: { id: userId } },
    };

    const quiz = await this.repo.createQuiz(payload);
    return quiz;
  }
}
