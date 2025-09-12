import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { QuizService } from './quiz.service';
import { Quiz } from 'types/quiz/quiz.model';
import { Prisma } from '@prisma/client';
import { QuizWhereInput } from 'types/quiz/quiz-where.input';
import { QuizUpdateInput } from 'types/quiz/quiz-update.input';
import { QuizUncheckedCreateInput } from 'types/quiz/quiz-unchecked-create.input';
import { QuizOrderByWithRelationInput } from 'types/quiz/quiz-order-by-with-relation.input';

@Resolver()
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

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
  async getQuiz(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Quiz | null> {
    return this.quizService.getQuiz(id);
  }

  @Mutation(() => Quiz, { name: 'DeleteQuiz' })
  async deleteQuiz(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Quiz | null> {
    return this.quizService.deleteQuiz(id);
  }

  @Mutation(() => Quiz, { name: `UpdateQuiz` })
  async updateQuiz(
    @Args({ name: `id`, type: () => String }) id: string,
    @Args({ name: `data`, type: () => QuizUpdateInput })
    data: Prisma.QuizUpdateInput,
  ): Promise<Quiz | null> {
    return await this.quizService.updateQuiz(id, data);
  }

  @Mutation(() => Quiz, { name: 'CreateQuiz' })
  async createQuiz(
    @Args('data', { type: () => QuizUncheckedCreateInput })
    data: Prisma.QuizUncheckedCreateInput,
  ): Promise<Quiz> {
    return await this.quizService.createQuiz(data);
  }
}
