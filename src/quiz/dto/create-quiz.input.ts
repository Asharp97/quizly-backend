import { InputType } from '@nestjs/graphql';
import { OmitType } from '@nestjs/graphql';
import { QuizCreateInput as QuizCreateInputBase } from 'types/quiz/quiz-create.input';

@InputType()
export class CreateQuizInput extends OmitType(QuizCreateInputBase, [
  'User',
  'link',
] as const) {}
