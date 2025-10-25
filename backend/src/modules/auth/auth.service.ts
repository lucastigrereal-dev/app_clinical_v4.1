import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // MVP: Credenciais hardcoded (depois conectar com banco de usuários)
  private readonly VALID_USERS = [
    { email: 'admin@clinic.com', password: 'admin123', role: 'admin' },
    { email: 'doctor@clinic.com', password: 'doctor123', role: 'doctor' },
    { email: 'demo@clinic.com', password: 'demo123', role: 'user' },
  ];

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Validar credenciais
    const user = this.VALID_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Gerar JWT token
    const payload = { email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      email: user.email,
      role: user.role,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
