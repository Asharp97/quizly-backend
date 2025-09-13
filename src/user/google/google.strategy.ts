import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('google-oauth.clientID'),
      clientSecret: configService.get<string>('google-oauth.clientSecret'),
      callbackURL: configService.get<string>('google-oauth.callbackURL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): void {
    const { emails } = profile;
    const user = {
      email: emails[0].value,
      accessToken,
      password: '',
    };
    done(null, user);
  }
}
