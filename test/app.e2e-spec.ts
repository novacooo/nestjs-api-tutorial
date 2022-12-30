import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from 'src/app.module';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

const BASE_URL = 'http://localhost:3333';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl(BASE_URL);
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'example@email.com',
      password: '123',
    };

    describe('Sign up', () => {
      it('should sign up user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(authDto)
          .expectStatus(201);
      });
    });

    describe('Sign in', () => {
      it('should sign in user', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(authDto)
          .expectStatus(200);
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it.todo('should get me');
    });

    describe('Edit user', () => {
      it.todo('should edit user');
    });
  });

  describe('Bookmark', () => {
    describe('Create bookmark', () => {
      it.todo('should create bookmark');
    });

    describe('Get bookmarks', () => {
      it.todo('should get bookmarks');
    });

    describe('Get bookmark by id', () => {
      it.todo('should get bookmark by id');
    });

    describe('Edit bookmark', () => {
      it.todo('should edit bookmark');
    });

    describe('Delete bookmark', () => {
      it.todo('should delete bookmark');
    });
  });
});
