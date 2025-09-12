import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'types/user/user.model';

@ObjectType()
export class authResponseDTO {
  @Field(() => User, { nullable: true })
  user: User;

  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}
