import { Prisma } from '@prisma/client';
import { QuizSubmission } from 'types/quiz-submission/quiz-submission.model';
import { QuizSubmissionRepository } from './quiz-submission.repository';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class QuizSubmissionService {
  constructor(
    private repo: QuizSubmissionRepository,
    private userService: UserService,
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
  ): Promise<QuizSubmission> {
    const userId = this.userService.getUserIdFromToken(token);
    if (!userId) {
      throw new Error('Invalid token');
    }

    const payload = {
      ...data,
      User: { connect: { id: userId } },
    };

    const quizSubmission = await this.repo.createQuizSubmission(payload);
    return quizSubmission;
  }
}
