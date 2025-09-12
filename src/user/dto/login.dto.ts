import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class loginRequestDTO {
  @Field(() => String)
  email: string | null;

  @Field(() => String)
  password: string | null;
}
