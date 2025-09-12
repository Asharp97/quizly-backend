import { Prisma } from '@prisma/client';
import { Question } from 'types/question/question.model';
import { QuestionRepository } from './question.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionService {
  constructor(private repo: QuestionRepository) {}
  async getQuestions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuestionWhereInput;
    orderBy?: Prisma.QuestionOrderByWithRelationInput;
  }): Promise<Question[]> {
    return await this.repo.getQuestions(params);
  }

  async getQuestion(id: string): Promise<Question | null> {
    return await this.repo.getQuestion(id);
  }

  async deleteQuestion(id: string): Promise<Question | null> {
    return await this.repo.deleteQuestion(id);
  }

  async updateQuestion(
    id: string,
    data: Prisma.QuestionUpdateInput,
  ): Promise<Question | null> {
    return await this.repo.updateQuestion({ where: { id }, data });
  }

  async createQuestion(
    data: Prisma.QuestionUncheckedCreateInput,
  ): Promise<Question> {
    const question = await this.repo.createQuestion(data);
    return question;
  }
}
