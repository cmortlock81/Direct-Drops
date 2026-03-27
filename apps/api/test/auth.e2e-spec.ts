import { Controller, Post, Body } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

@Controller('auth')
class TestAuthController {
  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    if (!body.username || !body.password) return { error: 'invalid' };
    return { accessToken: 'token', refreshToken: 'refresh' };
  }
}

describe('Auth e2e smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [TestAuthController] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns tokens', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({ username: 'admin', password: 'Password123!' }).expect(201);
    expect(res.body.accessToken).toBeDefined();
  });
});
