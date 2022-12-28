import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp({ email, password }: AuthDto) {
    // Generate the password hash
    const hash = await argon.hash(password);

    try {
      // Save the new user in the db
      const user = await this.prismaService.user.create({
        data: { email, hash },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      // Check if credentials are taken
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials taken');
      }

      // If not throw error
      throw error;
    }
  }

  async signIn({ email, password }: AuthDto) {
    // Find the user by email
    const user = await this.prismaService.user.findUnique({ where: { email } });

    // If user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // Compare passwords
    const pwMatches = await argon.verify(user.hash, password);

    // If password is incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string) {
    const payload = { email, sub: userId };
    const secret = this.configService.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '15m',
    });

    return { access_token: token };
  }
}
