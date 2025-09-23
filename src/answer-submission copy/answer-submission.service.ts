import { Prisma } from '@prisma/client';
import { AnswerSubmission } from 'types/answer-submission/answer-submission.model';
import { AnswerSubmissionRepository } from './answer-submission.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnswerSubmissionService {
  constructor(private repo: AnswerSubmissionRepository) {}
  async getAnswerSubmissions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AnswerSubmissionWhereInput;
    orderBy?: Prisma.AnswerSubmissionOrderByWithRelationInput;
  }): Promise<AnswerSubmission[]> {
    return await this.repo.getAnswerSubmissions(params);
  }

  async getAnswerSubmission(id: string): Promise<AnswerSubmission | null> {
    return await this.repo.getAnswerSubmission(id);
  }

  async deleteAnswerSubmission(id: string): Promise<AnswerSubmission | null> {
    return await this.repo.deleteAnswerSubmission(id);
  }

  async updateAnswerSubmission(
    id: string,
    data: Prisma.AnswerSubmissionUpdateInput,
  ): Promise<AnswerSubmission | null> {
    return await this.repo.updateAnswerSubmission({ where: { id }, data });
  }

  async createAnswerSubmission(
    data: Prisma.AnswerSubmissionCreateInput,
  ): Promise<AnswerSubmission> {
    const answerSubmission = await this.repo.createAnswerSubmission(data);
    return answerSubmission;
  }
}
