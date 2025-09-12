import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class signUpRequestDTO {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
