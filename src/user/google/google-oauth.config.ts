import { registerAs } from '@nestjs/config';

export default registerAs('google-oauth', () => ({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
  scope: ['email', 'profile'],
}));
