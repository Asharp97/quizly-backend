import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { QuizService } from './quiz.service';
import { Quiz } from 'types/quiz/quiz.model';
import { Prisma } from '@prisma/client';
import { QuizWhereInput } from 'types/quiz/quiz-where.input';
import { QuizUpdateInput } from 'types/quiz/quiz-update.input';
import { QuizOrderByWithRelationInput } from 'types/quiz/quiz-order-by-with-relation.input';
import { CreateQuizInput } from './dto/create-quiz.input';
import type { GqlContext } from 'src/common/types/gql-context.type';
import extractTokenFromHeader from 'src/common/utils/extractTokenFromHeader';
import { QuizWhereUniqueInput } from 'types/quiz/quiz-where-unique.input';
import { Public } from 'src/common/decorators/public.decorator';
import { Inject, UseInterceptors } from '@nestjs/common';
import { CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  GraphqlCacheInterceptor,
  buildQuizByIdCacheKey,
  buildQuizByLinkCacheKey,
} from 'src/common/cache/graphql-cache.interceptor';

@Resolver()
export class QuizResolver {
  constructor(
    private readonly quizService: QuizService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Query(() => [Quiz], { name: 'GetQuizzes' })
  async getQuizzes(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('where', { type: () => QuizWhereInput, nullable: true })
    where?: QuizWhereInput,
    @Args('orderBy', {
      type: () => QuizOrderByWithRelationInput,
      nullable: true,
    })
    orderBy?: QuizOrderByWithRelationInput,
  ): Promise<Quiz[]> {
    return this.quizService.getQuizzes({ skip, take, where, orderBy });
  }

  @Query(() => Quiz, { name: 'GetQuiz' })
  @UseInterceptors(GraphqlCacheInterceptor)
  @CacheTTL(600) // 10 minutes
  async getQuiz(
    @Args('where', { type: () => QuizWhereUniqueInput })
    where: Prisma.QuizWhereUniqueInput,
  ): Promise<Quiz | null> {
    return this.quizService.getQuiz({ where });
  }

  @Mutation(() => Quiz, { name: 'DeleteQuiz' })
  async deleteQuiz(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Quiz | null> {
    const quiz = await this.quizService.deleteQuiz(id);
    await this.cacheManager.del(buildQuizByIdCacheKey(id));
    return quiz;
  }

  @Mutation(() => Quiz, { name: `UpdateQuiz` })
  async updateQuiz(
    @Args({ name: `id`, type: () => String }) id: string,
    @Args({ name: `data`, type: () => QuizUpdateInput })
    data: Prisma.QuizUpdateInput,
  ): Promise<Quiz | null> {
    const quiz = await this.quizService.updateQuiz(id, data);
    await this.cacheManager.del(buildQuizByIdCacheKey(id));
    return quiz;
  }

  @Mutation(() => Quiz, { name: 'CreateQuiz' })
  async createQuiz(
    @Args('data', { type: () => CreateQuizInput })
    data: Prisma.QuizCreateInput,
    @Context() { req }: GqlContext,
  ): Promise<Quiz> {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new Error('No token provided');
    }

    const quiz = await this.quizService.createQuiz(data, token);
    await this.cacheManager.del(buildQuizByIdCacheKey(quiz.id));
    if (quiz.link) {
      await this.cacheManager.del(buildQuizByLinkCacheKey(quiz.link));
    }
    return quiz;
  }

  @Public()
  @Query(() => Quiz, { name: 'VerifyQuizLink' })
  @UseInterceptors(GraphqlCacheInterceptor)
  @CacheTTL(300) // 5 minutes
  async verifyQuizLink(@Args('link') link: string) {
    return await this.quizService.verifyQuizLink(link);
  }
}
