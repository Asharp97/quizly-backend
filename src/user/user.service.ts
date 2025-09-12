import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { User } from '../../types/user/user.model';
import { UserRepository } from './user.repository';
import { hash, compare } from 'bcryptjs';
import { signUpRequestDTO } from './dto/signupRequest.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { authResponseDTO } from './dto/authResponse.dto';
import { LogoutResponse } from './dto/logoutResponse.dto';

@Injectable()
export class UserService {
  private readonly redis: Redis;
  constructor(
    private readonly repo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  async getUsers(): Promise<User[]> {
    return await this.repo.getUsers();
  }

  async getUser(id: string): Promise<User | null> {
    return await this.repo.getUser(id);
  }

  async deleteUser(id: string): Promise<User | null> {
    return await this.repo.deleteUser(id);
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    return await this.repo.updateUser({ where: { id }, data });
  }

  async createUser(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return await this.repo.createUser(data);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repo.getUserByEmail(email);
  }

  async signUp(data: signUpRequestDTO): Promise<authResponseDTO> {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }
    data.email = data.email.toLowerCase();
    const existingUser = await this.repo.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    data.password = await hash(data.password, 10);
    const user = await this.repo.createUser(data);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return this.generateToken(user);
  }

  async login(
    email: string,
    password: string,
  ): Promise<authResponseDTO | null> {
    const user = await this.repo.getUserByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('User not found');
    }
    return this.generateToken(user);
  }

  async logout(accessToken: string): Promise<LogoutResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken);

      const userId = payload.data?.userId;
      const sessionId = payload.data?.sessionId;

      if (!userId || !sessionId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const accessTokenKey = `accessToken:${userId}:${sessionId}`;
      const refreshTokenKey = `refreshToken:${userId}:${sessionId}`;

      await this.redis.del(accessTokenKey, refreshTokenKey);

      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout failed:', error.message);
      return { success: false, message: 'Logout failed' };
    }
  }

  private generateToken(user: User) {
    const sessionId = v4();

    const _accessTokenKey = `accessToken:${user?.id}:${sessionId}`;
    const _refreshTokenKey = `refreshToken:${user?.id}:${sessionId}`;

    const _accessTokenPayload = {
      data: {
        userId: user?.id,
        sessionId,
        key: _accessTokenKey,
      },
    };
    const _refreshTokenPayload = {
      data: {
        userId: user?.id || 'Anonymous',
        sessionId,
        key: _refreshTokenKey,
      },
    };

    const expiresInAccessToken = 7 * 24 * 60 * 60;
    const expiresInRefreshToken = 30 * 24 * 60 * 60;

    const _accessToken = this.jwtService.sign(_accessTokenPayload, {
      expiresIn: expiresInAccessToken,
    });

    const _refreshToken = this.jwtService.sign(_refreshTokenPayload, {
      expiresIn: expiresInRefreshToken,
    });

    void this.redis.hmset(_accessTokenKey, {
      key: _accessTokenKey,
      sessionId,
      accessToken: _accessToken,
    });

    void this.redis.hmset(_refreshTokenKey, {
      key: _refreshTokenKey,
      sessionId,
      refreshToken: _refreshToken,
    });

    void this.redis.expire(_accessTokenKey, expiresInAccessToken);
    void this.redis.expire(_refreshTokenKey, expiresInRefreshToken);

    return {
      user,
      accessToken: _accessToken,
      refreshToken: _refreshToken,
    };
  }

  getUserIdFromToken(token: string): string | null {
    try {
      const payload: { data: { userId: string } } =
        this.jwtService.verify(token);
      return payload.data?.userId || null;
    } catch {
      throw new Error('Invalid token');
    }
  }
}
