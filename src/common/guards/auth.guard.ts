import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import extractTokenFromHeader from '../utils/extractTokenFromHeader';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly redis: Redis;
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const sessionKey = payload.data?.key;
      if (!sessionKey) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const sessionExists = await this.redis.exists(sessionKey);
      if (!sessionExists) {
        throw new UnauthorizedException('Session has been terminated');
      }
      request['user'] = payload;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException();
    }
    return true;
  }
}
