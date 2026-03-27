import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { username, isActive: true } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, role: user.role, name: user.name };
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
      user: { id: user.id, role: user.role, name: user.name }
    };
  }

  refresh(token: string) {
    const payload = this.jwt.verify(token);
    return { accessToken: this.jwt.sign({ sub: payload.sub, role: payload.role, name: payload.name }, { expiresIn: '15m' }) };
  }

  me(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, name: true, username: true, phone: true } });
  }
}
