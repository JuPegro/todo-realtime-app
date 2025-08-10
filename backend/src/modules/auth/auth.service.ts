import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto } from './dto';
import { User } from '@prisma/client';
import { InvalidCredentialsException } from '../../common/exceptions/custom.exceptions';
import { JwtPayload } from './strategies/jwt.strategy';
import { TokenBlacklistService } from './services/token-blacklist.service';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.userService.create(registerDto);
    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Validar contraseña
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return this.generateAuthResponse(user);
  }

  async validateUser(id: string): Promise<User> {
    return this.userService.findById(id);
  }

  async logout(token: string): Promise<void> {
    // Agregar token a la blacklist
    this.tokenBlacklistService.addToBlacklist(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklistService.isBlacklisted(token);
  }

  private generateAuthResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }
}