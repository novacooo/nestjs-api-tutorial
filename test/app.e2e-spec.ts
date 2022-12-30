import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from 'src/app.module';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';

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
      const path = '/auth/signup';

      it('should throw exception if no body provided', () => {
        return pactum.spec().post(path).expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({ password: authDto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({ email: authDto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should sign up user', () => {
        return pactum
          .spec()
          .post(path)
          .withBody(authDto)
          .expectStatus(HttpStatus.CREATED);
      });

      it('should not sign up if credentials are taken', () => {
        return pactum
          .spec()
          .post(path)
          .withBody(authDto)
          .expectStatus(HttpStatus.FORBIDDEN);
      });
    });

    describe('Sign in', () => {
      const path = '/auth/signin';

      it('should throw exception if no body provided', () => {
        return pactum.spec().post(path).expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({ password: authDto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({ email: authDto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should not sign in user if credentials are wrong', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({ email: 'wrong@email.com', password: '123' })
          .expectStatus(HttpStatus.FORBIDDEN);
      });

      it('should sign in user', () => {
        return pactum
          .spec()
          .post(path)
          .withBody(authDto)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      const path = '/user/me';

      it('should not get current user if unauthorized', () => {
        return pactum.spec().get(path).expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should not get current user if wrong token', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({
            Authorization: 'Bearer 123',
          })
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('should get current user', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('Edit user', () => {
      const path = '/user/edit';

      it('should edit user', () => {
        const editUserDto: EditUserDto = {
          firstName: 'John',
          email: 'john@email.com',
        };

        return pactum
          .spec()
          .patch(path)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(editUserDto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(editUserDto.firstName)
          .expectBodyContains(editUserDto.email);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      const path = '/bookmark';

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const path = '/bookmark';

      const createBookmarkDto: CreateBookmarkDto = {
        title: 'First bookmark',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s',
      };

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post(path)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(createBookmarkDto)
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      const path = '/bookmark';

      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      const path = '/bookmark/{id}';

      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(path)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const path = '/bookmark/{id}';

      const editBookmarkDto: EditBookmarkDto = {
        title: 'New title',
        description: 'New description.',
      };

      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch(path)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(editBookmarkDto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(editBookmarkDto.title)
          .expectBodyContains(editBookmarkDto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.NO_CONTENT);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBody([]);
      });
    });
  });
});
