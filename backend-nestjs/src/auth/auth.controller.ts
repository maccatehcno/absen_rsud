import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const { nip, password } = body;

    if (!nip || !password) {
      throw new HttpException(
        'NIP and Password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.authService.validateUser(nip, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }
}
