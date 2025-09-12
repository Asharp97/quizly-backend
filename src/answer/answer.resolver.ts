import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AnswerService } from './answer.service';
import { Answer } from 'types/answer/answer.model';
import { Prisma } from '@prisma/client';
import { AnswerUpdateInput } from 'types/answer/answer-update.input';
import { AnswerUncheckedCreateInput } from 'types/answer/answer-unchecked-create.input';
import { AnswerOrderByWithRelationInput } from 'types/answer/answer-order-by-with-relation.input';
import { AnswerWhereInput } from 'types/answer/answer-where.input';

@Resolver()
export class AnswerResolver {
  constructor(private readonly answerService: AnswerService) {}

  @Query(() => [Answer], { name: 'GetAnswers' })
  async getAnswers(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('where', { type: () => AnswerWhereInput, nullable: true })
    where?: AnswerWhereInput,
    @Args('orderBy', {
      type: () => AnswerOrderByWithRelationInput,
      nullable: true,
    })
    orderBy?: AnswerOrderByWithRelationInput,
  ): Promise<Answer[]> {
    return this.answerService.getAnswers({ skip, take, where, orderBy });
  }

  @Query(() => Answer, { name: 'GetAnswer' })
  async getAnswer(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Answer | null> {
    return this.answerService.getAnswer(id);
  }

  @Mutation(() => Answer, { name: 'DeleteAnswer' })
  async deleteAnswer(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Answer | null> {
    return this.answerService.deleteAnswer(id);
  }

  @Mutation(() => Answer, { name: `UpdateAnswer` })
  async updateAnswer(
    @Args({ name: `id`, type: () => String }) id: string,
    @Args({ name: `data`, type: () => AnswerUpdateInput })
    data: Prisma.AnswerUpdateInput,
  ): Promise<Answer | null> {
    return await this.answerService.updateAnswer(id, data);
  }

  @Mutation(() => Answer, { name: 'CreateAnswer' })
  async createAnswer(
    @Args('data', { type: () => AnswerUncheckedCreateInput })
    data: Prisma.AnswerUncheckedCreateInput,
  ): Promise<Answer> {
    return await this.answerService.createAnswer(data);
  }
}
