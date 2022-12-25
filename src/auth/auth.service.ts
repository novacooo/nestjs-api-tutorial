import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signIn() {
    return { msg: 'Signed in!' };
  }

  signUp() {
    return { msg: 'Signed up!' };
  }
}
