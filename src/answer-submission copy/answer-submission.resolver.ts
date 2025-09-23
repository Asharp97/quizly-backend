import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AnswerSubmissionService } from './answer-submission.service';
import { AnswerSubmission } from 'types/answer-submission/answer-submission.model';
import { Prisma } from '@prisma/client';
import { AnswerSubmissionUpdateInput } from 'types/answer-submission/answer-submission-update.input';
import { AnswerSubmissionOrderByWithRelationInput } from 'types/answer-submission/answer-submission-order-by-with-relation.input';
import { AnswerSubmissionWhereInput } from 'types/answer-submission/answer-submission-where.input';
import { AnswerSubmissionCreateInput } from 'types/answer-submission/answer-submission-create.input';

@Resolver()
export class AnswerSubmissionResolver {
  constructor(
    private readonly answerSubmissionService: AnswerSubmissionService,
  ) {}

  @Query(() => [AnswerSubmission], { name: 'GetAnswerSubmissions' })
  async getAnswerSubmissions(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('where', { type: () => AnswerSubmissionWhereInput, nullable: true })
    where?: AnswerSubmissionWhereInput,
    @Args('orderBy', {
      type: () => AnswerSubmissionOrderByWithRelationInput,
      nullable: true,
    })
    orderBy?: AnswerSubmissionOrderByWithRelationInput,
  ): Promise<AnswerSubmission[]> {
    return this.answerSubmissionService.getAnswerSubmissions({
      skip,
      take,
      where,
      orderBy,
    });
  }

  @Query(() => AnswerSubmission, { name: 'GetAnswerSubmission' })
  async getAnswerSubmission(
    @Args('id', { type: () => String }) id: string,
  ): Promise<AnswerSubmission | null> {
    return this.answerSubmissionService.getAnswerSubmission(id);
  }

  @Mutation(() => AnswerSubmission, { name: 'DeleteAnswerSubmission' })
  async deleteAnswerSubmission(
    @Args('id', { type: () => String }) id: string,
  ): Promise<AnswerSubmission | null> {
    return this.answerSubmissionService.deleteAnswerSubmission(id);
  }

  @Mutation(() => AnswerSubmission, { name: `UpdateAnswerSubmission` })
  async updateAnswerSubmission(
    @Args({ name: `id`, type: () => String }) id: string,
    @Args({ name: `data`, type: () => AnswerSubmissionUpdateInput })
    data: Prisma.AnswerSubmissionUpdateInput,
  ): Promise<AnswerSubmission | null> {
    return await this.answerSubmissionService.updateAnswerSubmission(id, data);
  }

  @Mutation(() => AnswerSubmission, { name: 'CreateAnswerSubmission' })
  async createAnswerSubmission(
    @Args('data', { type: () => AnswerSubmissionCreateInput })
    data: Prisma.AnswerSubmissionCreateInput,
  ): Promise<AnswerSubmission> {
    return await this.answerSubmissionService.createAnswerSubmission(data);
  }
}
