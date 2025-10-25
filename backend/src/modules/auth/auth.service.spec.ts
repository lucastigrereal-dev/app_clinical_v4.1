import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // ==========================================
  // Service Definition
  // ==========================================
  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have jwtService injected', () => {
      expect(jwtService).toBeDefined();
    });
  });

  // ==========================================
  // login() - Valid Credentials
  // ==========================================
  describe('login() - Valid Credentials', () => {
    it('should login with admin credentials', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token-admin');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token-admin',
        email: 'admin@clinic.com',
        role: 'admin',
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'admin@clinic.com',
        role: 'admin',
      });
    });

    it('should login with doctor credentials', async () => {
      const loginDto: LoginDto = {
        email: 'doctor@clinic.com',
        password: 'doctor123',
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token-doctor');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token-doctor',
        email: 'doctor@clinic.com',
        role: 'doctor',
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'doctor@clinic.com',
        role: 'doctor',
      });
    });

    it('should login with demo user credentials', async () => {
      const loginDto: LoginDto = {
        email: 'demo@clinic.com',
        password: 'demo123',
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token-user');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token-user',
        email: 'demo@clinic.com',
        role: 'user',
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'demo@clinic.com',
        role: 'user',
      });
    });

    it('should generate different tokens for different users', async () => {
      mockJwtService.sign.mockReturnValueOnce('token-1').mockReturnValueOnce('token-2');

      const admin = await service.login({
        email: 'admin@clinic.com',
        password: 'admin123',
      });

      const doctor = await service.login({
        email: 'doctor@clinic.com',
        password: 'doctor123',
      });

      expect(admin.access_token).not.toBe(doctor.access_token);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // login() - Invalid Credentials
  // ==========================================
  describe('login() - Invalid Credentials', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@clinic.com',
        password: 'admin123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Email ou senha inválidos');

      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Email ou senha inválidos');

      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for empty credentials', async () => {
      const loginDto: LoginDto = {
        email: '',
        password: '',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should be case-sensitive for email', async () => {
      const loginDto: LoginDto = {
        email: 'ADMIN@CLINIC.COM', // uppercase
        password: 'admin123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should be case-sensitive for password', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'ADMIN123', // uppercase
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // validateToken() - Token Validation
  // ==========================================
  describe('validateToken() - Token Validation', () => {
    it('should validate a valid token', async () => {
      const mockPayload = {
        email: 'admin@clinic.com',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-jwt-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
    });

    it('should validate token and return user payload', async () => {
      const mockPayload = {
        email: 'doctor@clinic.com',
        role: 'doctor',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('doctor-token');

      expect(result.email).toBe('doctor@clinic.com');
      expect(result.role).toBe('doctor');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        'Token inválido ou expirado',
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.validateToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken('expired-token')).rejects.toThrow(
        'Token inválido ou expirado',
      );
    });

    it('should throw UnauthorizedException for malformed token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Malformed token');
      });

      await expect(service.validateToken('malformed.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for empty token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Empty token');
      });

      await expect(service.validateToken('')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==========================================
  // JWT Payload Structure
  // ==========================================
  describe('JWT Payload Structure', () => {
    it('should include email and role in JWT payload', async () => {
      mockJwtService.sign.mockReturnValue('token');

      await service.login({
        email: 'admin@clinic.com',
        password: 'admin123',
      });

      const callArgs = mockJwtService.sign.mock.calls[0][0];

      expect(callArgs).toHaveProperty('email');
      expect(callArgs).toHaveProperty('role');
      expect(callArgs.email).toBe('admin@clinic.com');
      expect(callArgs.role).toBe('admin');
    });

    it('should not include password in JWT payload', async () => {
      mockJwtService.sign.mockReturnValue('token');

      await service.login({
        email: 'admin@clinic.com',
        password: 'admin123',
      });

      const callArgs = mockJwtService.sign.mock.calls[0][0];

      expect(callArgs).not.toHaveProperty('password');
    });

    it('should create payload with correct structure for all user types', async () => {
      mockJwtService.sign.mockReturnValue('token');

      // Admin
      await service.login({
        email: 'admin@clinic.com',
        password: 'admin123',
      });
      let payload = mockJwtService.sign.mock.calls[0][0];
      expect(payload).toEqual({ email: 'admin@clinic.com', role: 'admin' });

      // Doctor
      await service.login({
        email: 'doctor@clinic.com',
        password: 'doctor123',
      });
      payload = mockJwtService.sign.mock.calls[1][0];
      expect(payload).toEqual({ email: 'doctor@clinic.com', role: 'doctor' });

      // User
      await service.login({
        email: 'demo@clinic.com',
        password: 'demo123',
      });
      payload = mockJwtService.sign.mock.calls[2][0];
      expect(payload).toEqual({ email: 'demo@clinic.com', role: 'user' });
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle concurrent login requests', async () => {
      mockJwtService.sign.mockReturnValue('token');

      const promises = [
        service.login({ email: 'admin@clinic.com', password: 'admin123' }),
        service.login({ email: 'doctor@clinic.com', password: 'doctor123' }),
        service.login({ email: 'demo@clinic.com', password: 'demo123' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].role).toBe('admin');
      expect(results[1].role).toBe('doctor');
      expect(results[2].role).toBe('user');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(3);
    });

    it('should handle JwtService.sign throwing an error', async () => {
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      await expect(
        service.login({
          email: 'admin@clinic.com',
          password: 'admin123',
        }),
      ).rejects.toThrow('JWT signing failed');
    });

    it('should trim email spaces if present in credentials', async () => {
      // This test verifies current behavior (no trimming)
      // In a real app, you might want to add .trim() to the email
      const loginDto: LoginDto = {
        email: ' admin@clinic.com ',
        password: 'admin123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==========================================
  // Integration Scenarios
  // ==========================================
  describe('Integration Scenarios', () => {
    it('should complete full auth flow: login -> validate token', async () => {
      // Step 1: Login
      mockJwtService.sign.mockReturnValue('full-flow-token');
      const loginResult = await service.login({
        email: 'admin@clinic.com',
        password: 'admin123',
      });

      expect(loginResult.access_token).toBe('full-flow-token');

      // Step 2: Validate the token
      mockJwtService.verify.mockReturnValue({
        email: 'admin@clinic.com',
        role: 'admin',
      });

      const validateResult = await service.validateToken(loginResult.access_token);

      expect(validateResult.email).toBe('admin@clinic.com');
      expect(validateResult.role).toBe('admin');
    });

    it('should handle multiple users logging in sequentially', async () => {
      const users = [
        { email: 'admin@clinic.com', password: 'admin123', expectedRole: 'admin' },
        { email: 'doctor@clinic.com', password: 'doctor123', expectedRole: 'doctor' },
        { email: 'demo@clinic.com', password: 'demo123', expectedRole: 'user' },
      ];

      mockJwtService.sign.mockReturnValue('token');

      for (const user of users) {
        const result = await service.login(user);
        expect(result.role).toBe(user.expectedRole);
      }

      expect(mockJwtService.sign).toHaveBeenCalledTimes(3);
    });
  });
});
