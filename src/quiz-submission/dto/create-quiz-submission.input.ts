import { InputType } from '@nestjs/graphql';
import { OmitType } from '@nestjs/graphql';
import { QuizSubmissionCreateInput as QuizSubmissionCreateInputBase } from 'types/quiz-submission/quiz-submission-create.input';

@InputType()
export class CreateQuizSubmissionInput extends OmitType(
  QuizSubmissionCreateInputBase,
  ['User'] as const,
) {}
