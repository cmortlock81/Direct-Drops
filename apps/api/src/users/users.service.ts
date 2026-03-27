import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list(role?: string) { return this.prisma.user.findMany({ where: role ? { role: role as any } : undefined }); }

  async create(data: any) {
    const passwordHash = await argon2.hash(data.password || 'Password123!');
    const user = await this.prisma.user.create({ data: { ...data, passwordHash } });
    if (user.role === 'COURIER') await this.prisma.courier.create({ data: { userId: user.id, currentStatus: 'OFFLINE' } });
    return user;
  }

  update(userId: string, data: any) { return this.prisma.user.update({ where: { id: userId }, data }); }
  activate(userId: string) { return this.update(userId, { isActive: true }); }
  deactivate(userId: string) { return this.update(userId, { isActive: false }); }
  async resetPassword(userId: string, password = 'Password123!') { return this.update(userId, { passwordHash: await argon2.hash(password) }); }
}
