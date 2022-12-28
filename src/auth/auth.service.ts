import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  signUp(authDto: AuthDto) {
    return { msg: 'Signed up!' };
  }

  signIn() {
    return { msg: 'Signed in!' };
  }
}
