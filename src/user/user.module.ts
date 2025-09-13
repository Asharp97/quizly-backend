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

@Module({
  providers: [UserRepository, UserResolver, UserService, GoogleStrategy],
  exports: [UserService],
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [GoogleController],
})
export class UserModule {}
