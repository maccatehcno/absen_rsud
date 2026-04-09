import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(nip: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByNip(nip);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { nip: user.nip, sub: user.id, role: user.role };
    return {
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          nip: user.nip,
          role: user.role,
          jabatan: user.jabatan,
        },
        access_token: this.jwtService.sign(payload),
      },
    };
  }
}
