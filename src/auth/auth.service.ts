import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto, SignUpDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async userSignUp(dto: SignUpDto) {
    try {
      //  hash user's password
      const hashedPassword = await argon.hash(dto.password);

      // create new user
      const user = await this.prismaService.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          password: hashedPassword,
        },
      });

      return this.assignToken(dto.email, dto.password, dto.username);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if ((error.code = 'P2002')) {
          throw new ForbiddenException('Email has been taken.');
        }
      }

      throw error;
    }
  }

  async userLogin(dto: LoginDto) {
    // check if email exists
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('User does not exist.');

    const checkPassword = argon.verify(user.password, dto.password);

    if (!checkPassword) throw new ForbiddenException('Password incorrect!');

    return this.assignToken(dto.email, dto.password);
  }

  async assignToken(
    email: string,
    password: string,
    username?: string,
  ): Promise<{ email: string; username: string; access_token: string }> {
    const payload = {
      sub: email,
      password,
      username,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '30min',
      secret: this.configService.get('JWT_SECRET'),
    });

    return {
      email,
      username: username,
      access_token: token,
    };
  }
}
