import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { QuizSubmissionService } from './quiz-submission.service';
import { QuizSubmission } from 'types/quiz-submission/quiz-submission.model';
import { Prisma } from '@prisma/client';
import { QuizSubmissionUpdateInput } from 'types/quiz-submission/quiz-submission-update.input';
import { QuizSubmissionOrderByWithRelationInput } from 'types/quiz-submission/quiz-submission-order-by-with-relation.input';
import { QuizSubmissionWhereInput } from 'types/quiz-submission/quiz-submission-where.input';
import type { GqlContext } from 'src/common/types/gql-context.type';
import extractTokenFromHeader from 'src/common/utils/extractTokenFromHeader';
import { CreateQuizSubmissionInput } from './dto/create-quiz-submission.input';

@Resolver()
export class QuizSubmissionResolver {
  constructor(private readonly quizSubmissionService: QuizSubmissionService) {}

  @Query(() => [QuizSubmission], { name: 'GetQuizSubmissions' })
  async getQuizSubmissions(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('where', { type: () => QuizSubmissionWhereInput, nullable: true })
    where?: QuizSubmissionWhereInput,
    @Args('orderBy', {
      type: () => QuizSubmissionOrderByWithRelationInput,
      nullable: true,
    })
    orderBy?: QuizSubmissionOrderByWithRelationInput,
  ): Promise<QuizSubmission[]> {
    return this.quizSubmissionService.getQuizSubmissions({
      skip,
      take,
      where,
      orderBy,
    });
  }

  @Query(() => Number, { name: 'GetQuizSubmissionsCount' })
  async getQuizSubmissionsCount(
    @Args('where', { type: () => QuizSubmissionWhereInput, nullable: true })
    where?: QuizSubmissionWhereInput,
  ): Promise<number> {
    return this.quizSubmissionService.getQuizSubmissionsCount({ where });
  }

  @Query(() => QuizSubmission, { name: 'GetQuizSubmission' })
  async getQuizSubmission(
    @Args('id', { type: () => String }) id: string,
  ): Promise<QuizSubmission | null> {
    return this.quizSubmissionService.getQuizSubmission(id);
  }

  @Mutation(() => QuizSubmission, { name: 'DeleteQuizSubmission' })
  async deleteQuizSubmission(
    @Args('id', { type: () => String }) id: string,
  ): Promise<QuizSubmission | null> {
    return this.quizSubmissionService.deleteQuizSubmission(id);
  }

  @Mutation(() => QuizSubmission, { name: `UpdateQuizSubmission` })
  async updateQuizSubmission(
    @Args({ name: `id`, type: () => String }) id: string,
    @Args({ name: `data`, type: () => QuizSubmissionUpdateInput })
    data: Prisma.QuizSubmissionUpdateInput,
  ): Promise<QuizSubmission | null> {
    return await this.quizSubmissionService.updateQuizSubmission(id, data);
  }

  @Mutation(() => QuizSubmission, { name: 'CreateQuizSubmission' })
  async createQuizSubmission(
    @Args('data', { type: () => CreateQuizSubmissionInput })
    data: Prisma.QuizSubmissionCreateInput,
    @Context() { req }: GqlContext,
  ): Promise<QuizSubmission> {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new Error('No token provided');
    }

    return await this.quizSubmissionService.createQuizSubmission(data, token);
  }
}
