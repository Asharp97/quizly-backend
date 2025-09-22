import { Prisma } from '@prisma/client';
import { Question } from 'types/question/question.model';
import { QuestionRepository } from './question.repository';
import { Injectable } from '@nestjs/common';
import { AnswerService } from 'src/answer/answer.service';
import { question_type } from 'types/prisma/question-type.enum';

@Injectable()
export class QuestionService {
  constructor(
    private repo: QuestionRepository,
    private answerService: AnswerService,
  ) {}
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

  async updateQuestionWithAnswers(
    questionId: string,
    question: Prisma.QuestionUpdateInput,
    answers: Prisma.AnswerCreateManyInput[],
  ): Promise<Question | null> {
    const data: Record<string, any> = {};
    const fields = ['text', 'type', 'trueFalseAnswer', 'points'];
    fields.forEach((key) => {
      if (question[key] !== undefined) {
        data[key] = { set: question[key] };
      }
    });
    console.log('Updating question with data:', data);
    const updatedQuestion = await this.repo.updateQuestion({
      where: { id: questionId },
      data,
    });
    if (!updatedQuestion) return null;

    if (updatedQuestion.type === question_type.MULTIPLE_CHOICE) {
      const answerCount = await this.repo.updateMCQAnswers(questionId, answers);
      if (answerCount === 0) throw new Error('Failed to update answers');
    }

    return updatedQuestion;
  }
}
