import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  signIn() {
    return { msg: 'Signed in!' };
  }

  signUp() {
    return { msg: 'Signed up!' };
  }
}
