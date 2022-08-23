import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { SignUpDto } from '../src/auth/dto';

describe('app e2e', () => {
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

    await prisma.cleanDB();

    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: SignUpDto = {
      email: 'okaa.wibawa@gmail.com',
      password: 'okaokaoka',
      username: 'oka',
    };

    describe('Sign up', () => {
      // empty signup
      it('empty signup', () => {
        return pactum.spec().post('auth/sign-up').expectStatus(400);
      });

      // signup without email
      it('signup without email', () => {
        return pactum
          .spec()
          .post('auth/sign-up')
          .withBody({
            username: dto.username,
            password: dto.password,
          })
          .expectStatus(400);
      });

      // signup without password
      it('signup without password', () => {
        return pactum
          .spec()
          .post('auth/sign-up')
          .withBody({
            email: dto.email,
            username: dto.username,
          })
          .expectStatus(400);
      });

      // signup without username
      it('signup without username', () => {
        return pactum
          .spec()
          .post('auth/sign-up')
          .withBody({
            email: dto.email,
            password: dto.password,
          })
          .expectStatus(400);
      });

      // signup test
      it('signup', () => {
        return pactum
          .spec()
          .post('auth/sign-up')
          .withBody(dto)
          .expectStatus(201);
      });

      // signup with the same email
      it('signup with the same email', () => {
        return pactum
          .spec()
          .post('auth/sign-up')
          .withBody(dto)
          .expectStatus(403);
      });
    });

    describe('Login', () => {
      // empty login
      it('empty login', () => {
        return pactum.spec().post('auth/login').expectStatus(400);
      });

      // login without email
      it('login without email', () => {
        return pactum
          .spec()
          .post('auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      // login without password
      it('login without password', () => {
        return pactum
          .spec()
          .post('auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      // login test
      it('login', () => {
        return pactum
          .spec()
          .post('auth/login')
          .withBody({
            email: dto.email,
            password: dto.password,
          })
          .expectStatus(201);
      });
    });
  });

  it.todo('Testing Integration and E2E.');
});
