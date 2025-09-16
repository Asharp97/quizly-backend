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
import { CookieOptions, Response, Request } from 'express';

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

  handleCookies(res: Response, authRes: authResponseDTO) {
    // if (process.env.AUTH_STRATEGY !== 'httpOnlyCookie') return;
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      path: '/',
      secure: true, // Required for SameSite=None
      sameSite: 'none', // Allows cross-origin cookies
    };

    const accessTokenCookieOptions: CookieOptions = {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    };

    const refreshTokenCookieOptions: CookieOptions = {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    res.cookie('accessToken', authRes.accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', authRes.refreshToken, refreshTokenCookieOptions);
  }

  @Public()
  @Mutation(() => authResponseDTO, { name: 'SignUp' })
  async signUp(
    @Args('data') data: signUpRequestDTO,
    @Context() { res }: { res: Response },
  ): Promise<authResponseDTO> {
    const authRes = await this.userService.signUp(data);
    if (!authRes || !authRes.accessToken || !authRes.refreshToken) {
      throw new Error('Sign up failed');
    }

    this.handleCookies(res, authRes);

    return authRes;
  }

  @Public()
  @Mutation(() => authResponseDTO, { name: 'Login' })
  async login(
    @Args('email', { type: () => String }) email: string,
    @Args('password', { type: () => String }) password: string,
    @Context() { res }: { res: Response },
  ): Promise<authResponseDTO> {
    const authRes = await this.userService.login(email, password);
    if (!authRes || !authRes.accessToken || !authRes.refreshToken) {
      throw new Error('Login failed');
    }

    this.handleCookies(res, authRes);

    return authRes;
  }

  @Public()
  @Mutation(() => LogoutResponse, { name: 'Logout' })
  async logout(@Context() { req, res }: GqlContext): Promise<LogoutResponse> {
    const accessToken: string = req.cookies?.accessToken;

    if (!accessToken) {
      // Even if there's no token, we can just clear cookies and confirm logout
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return { message: 'Logged out successfully', success: true };
    }

    const result = await this.userService.logout(accessToken);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return result;
  }

  @Public() // Refresh endpoint needs to be public but requires a valid refresh token
  @Mutation(() => authResponseDTO, { name: 'RefreshToken' })
  async refreshToken(
    @Args('refreshToken', { type: () => String }) refreshToken: string,
    @Context() { res }: { res: Response },
  ): Promise<authResponseDTO> {
    if (!refreshToken) {
      throw new Error('Refresh token is missing');
    }

    const authRes = await this.userService.refreshToken(refreshToken);
    if (!authRes) {
      throw new Error('Failed to refresh token');
    }

    this.handleCookies(res, authRes);

    return authRes;
  }

  @Query(() => User, { name: 'Me' })
  async me(@Context() { req }): Promise<User | null> {
    const accessToken: string = req.token;
    if (!accessToken) {
      throw new Error('Access token is missing');
    }
    const user = await this.userService.getUserFromToken(accessToken);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
