import { Prisma } from '@prisma/client';
import { Answer } from 'types/answer/answer.model';
import { AnswerRepository } from './answer.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnswerService {
  constructor(private repo: AnswerRepository) {}
  async getAnswers(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AnswerWhereInput;
    orderBy?: Prisma.AnswerOrderByWithRelationInput;
  }): Promise<Answer[]> {
    return await this.repo.getAnswers(params);
  }

  async getAnswer(id: string): Promise<Answer | null> {
    return await this.repo.getAnswer(id);
  }

  async deleteAnswer(id: string): Promise<Answer | null> {
    return await this.repo.deleteAnswer(id);
  }

  async updateAnswer(
    id: string,
    data: Prisma.AnswerUpdateInput,
  ): Promise<Answer | null> {
    return await this.repo.updateAnswer({ where: { id }, data });
  }

  async createAnswer(data: Prisma.AnswerUncheckedCreateInput): Promise<Answer> {
    const answer = await this.repo.createAnswer(data);
    return answer;
  }

  async createAnswers(
    data: Prisma.AnswerUncheckedCreateInput[],
  ): Promise<Prisma.BatchPayload> {
    const answers = await this.repo.createAnswers(data);
    return answers;
  }
}
