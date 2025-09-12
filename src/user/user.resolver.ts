import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from 'types/user/user.model';
import { Prisma } from '@prisma/client';
import { UserUpdateInput } from 'types/user/user-update.input';
import { UserUncheckedCreateInput } from 'types/user/user-unchecked-create.input';
import { signUpRequestDTO } from './dto/signupRequest.dto';
import { authResponseDTO } from './dto/authResponse.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LogoutResponse } from './dto/logoutResponse.dto';
import type { GqlContext } from 'src/common/types/gql-context.type';
import extractTokenFromHeader from 'src/common/utils/extractTokenFromHeader';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'GetUsers' })
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Query(() => User, { name: 'GetUser' })
  async getUser(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User | null> {
    return this.userService.getUser(id);
  }

  @Mutation(() => User, { name: 'DeleteUser' })
  async deleteUser(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User | null> {
    return this.userService.deleteUser(id);
  }

  @Mutation(() => User, { name: `UpdateUser` })
  async updateUser(
    @Args({ name: `id`, type: () => String }) id: string,
    @Args({ name: `data`, type: () => UserUpdateInput })
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    return await this.userService.updateUser(id, data);
  }

  @Mutation(() => User, { name: 'CreateUser' })
  async createUser(
    @Args('data', { type: () => UserUncheckedCreateInput })
    data: Prisma.UserUncheckedCreateInput,
  ): Promise<User> {
    return await this.userService.createUser(data);
  }

  @Query(() => User, { name: 'GetUserByEmail' })
  async getUserByEmail(
    @Args('email', { type: () => String }) email: string,
  ): Promise<User | null> {
    return this.userService.getUserByEmail(email);
  }

  @Public()
  @Mutation(() => authResponseDTO, { name: 'SignUp' })
  async signUp(@Args('data') data: signUpRequestDTO): Promise<authResponseDTO> {
    return this.userService.signUp(data);
  }

  @Public()
  @Mutation(() => authResponseDTO, { name: 'Login' })
  async login(
    @Args('email', { type: () => String }) email: string,
    @Args('password', { type: () => String }) password: string,
  ): Promise<authResponseDTO | null> {
    return this.userService.login(email, password);
  }

  @Mutation(() => LogoutResponse, { name: 'Logout' })
  async logout(@Context() context: GqlContext): Promise<LogoutResponse> {
    const accessToken = extractTokenFromHeader(context.req);
    if (!accessToken) {
      throw new Error('Access token is missing');
    }
    return await this.userService.logout(accessToken);
  }
}
