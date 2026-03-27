import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/current-user.decorator';

class LoginDto { @IsString() username!: string; @IsString() password!: string; }
class RefreshDto { @IsString() refreshToken!: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto.username, dto.password); }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }

  @Post('logout')
  logout() { return { ok: true }; }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@CurrentUser() user: any) { return this.auth.me(user.userId); }
}
