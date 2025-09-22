import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from 'types/question/question.model';
import { Prisma } from '@prisma/client';
import { AnswerCreateManyInput } from 'types/answer/answer-create-many.input';
import { QuestionUpdateInput } from 'types/question/question-update.input';
import { QuestionUncheckedCreateInput } from 'types/question/question-unchecked-create.input';
import { QuestionOrderByWithRelationInput } from 'types/question/question-order-by-with-relation.input';
import { QuestionWhereInput } from 'types/question/question-where.input';
import { QuestionCreateInput } from 'types/question/question-create.input';

@Resolver()
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [Question], { name: 'GetQuestions' })
  async getQuestions(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
    @Args('where', { type: () => QuestionWhereInput, nullable: true })
    where?: QuestionWhereInput,
    @Args('orderBy', {
      type: () => QuestionOrderByWithRelationInput,
      nullable: true,
    })
    orderBy?: QuestionOrderByWithRelationInput,
  ): Promise<Question[]> {
    return this.questionService.getQuestions({ skip, take, where, orderBy });
  }

  @Query(() => Question, { name: 'GetQuestion' })
  async getQuestion(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Question | null> {
    return this.questionService.getQuestion(id);
  }

  @Mutation(() => Question, { name: 'DeleteQuestion' })
  async deleteQuestion(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Question | null> {
    return this.questionService.deleteQuestion(id);
  }

  @Mutation(() => Question, { name: `UpdateQuestion` })
  async updateQuestion(
    @Args({ name: `id`, type: () => String }) id: string,
    @Args({ name: `data`, type: () => QuestionUpdateInput })
    data: Prisma.QuestionUpdateInput,
  ): Promise<Question | null> {
    return await this.questionService.updateQuestion(id, data);
  }

  @Mutation(() => Question, { name: 'CreateQuestion' })
  async createQuestion(
    @Args('data', { type: () => QuestionUncheckedCreateInput })
    data: Prisma.QuestionUncheckedCreateInput,
  ): Promise<Question> {
    return await this.questionService.createQuestion(data);
  }

  @Mutation(() => Question, { name: 'UpdateQuestionWithAnswers' })
  async updateQuestionWithAnswers(
    @Args('questionId', { type: () => String }) questionId: string,
    @Args('question', { type: () => QuestionCreateInput })
    question: Prisma.QuestionUpdateInput,
    @Args('answers', { type: () => [AnswerCreateManyInput] })
    answers: AnswerCreateManyInput[],
  ): Promise<Question | null> {
    return await this.questionService.updateQuestionWithAnswers(
      questionId,
      question,
      answers,
    );
  }
}
