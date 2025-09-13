import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user.service';
import { User } from 'types/user/user.model';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // This route will redirect to Google's login page
  }

  @Public()
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: { user: User }, @Res() res: Response) {
    const tokens = await this.userService.googleAuth(req.user);
    if (tokens) {
      res.redirect(
        `${process.env.DOMAIN}/dashboard?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
      );
    } else {
      res.redirect(`${process.env.DOMAIN}/login?error=auth_failed`);
    }
  }
}
