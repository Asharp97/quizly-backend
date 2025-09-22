import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from 'src/user/google/google-oauth.config';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google/google.strategy';
import { GoogleController } from './google/google.controller';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [UserRepository, UserResolver, UserService, GoogleStrategy],
  exports: [UserService],
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    ConfigModule.forFeature(googleOauthConfig),
    RedisModule.forRoot({
      config: {
        host: process.env.API_REDIS_HOST || 'localhost',
        port: parseInt(process.env.API_REDIS_PORT || '6379', 10),
        username: process.env.API_REDIS_USERNAME,
        password: process.env.API_REDIS_PASSWORD,
      },
    }),
    JwtModule.register({
      secret: process.env.API_JWT_SECRET || 'test_secret',
      signOptions: { issuer: process.env.API_JWT_ISSUER || 'test_issuer' },
    }),
  ],
  controllers: [GoogleController],
})
export class UserModule {}
