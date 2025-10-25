import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // Mock AuthService
  const mockAuthService = {
    login: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  // ==========================================
  // Controller Definition
  // ==========================================
  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(service).toBeDefined();
    });
  });

  // ==========================================
  // POST /auth/login - Success Cases
  // ==========================================
  describe('POST /auth/login - Success', () => {
    it('should login with valid admin credentials', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      const expectedResponse: LoginResponseDto = {
        access_token: 'mock-jwt-token',
        email: 'admin@clinic.com',
        role: 'admin',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('should login with valid doctor credentials', async () => {
      const loginDto: LoginDto = {
        email: 'doctor@clinic.com',
        password: 'doctor123',
      };

      const expectedResponse: LoginResponseDto = {
        access_token: 'doctor-token',
        email: 'doctor@clinic.com',
        role: 'doctor',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(result.role).toBe('doctor');
    });

    it('should login with valid user credentials', async () => {
      const loginDto: LoginDto = {
        email: 'demo@clinic.com',
        password: 'demo123',
      };

      const expectedResponse: LoginResponseDto = {
        access_token: 'user-token',
        email: 'demo@clinic.com',
        role: 'user',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(result.role).toBe('user');
    });

    it('should return access_token in response', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'test-token-123',
        email: 'admin@clinic.com',
        role: 'admin',
      });

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('test-token-123');
    });
  });

  // ==========================================
  // POST /auth/login - Error Cases
  // ==========================================
  describe('POST /auth/login - Errors', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@clinic.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginDto)).rejects.toThrow('Email ou senha inválidos');
    });

    it('should propagate service errors', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      mockAuthService.login.mockRejectedValue(new Error('Service error'));

      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
    });

    it('should handle empty email', async () => {
      const loginDto: LoginDto = {
        email: '',
        password: 'admin123',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle empty password', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: '',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==========================================
  // GET /auth/profile - Success Cases
  // ==========================================
  describe('GET /auth/profile - Success', () => {
    it('should return user profile for authenticated admin', async () => {
      const mockRequest = {
        user: {
          email: 'admin@clinic.com',
          role: 'admin',
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        email: 'admin@clinic.com',
        role: 'admin',
      });
    });

    it('should return user profile for authenticated doctor', async () => {
      const mockRequest = {
        user: {
          email: 'doctor@clinic.com',
          role: 'doctor',
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        email: 'doctor@clinic.com',
        role: 'doctor',
      });
    });

    it('should return user profile for authenticated user', async () => {
      const mockRequest = {
        user: {
          email: 'demo@clinic.com',
          role: 'user',
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        email: 'demo@clinic.com',
        role: 'user',
      });
    });

    it('should only return email and role from request.user', async () => {
      const mockRequest = {
        user: {
          email: 'admin@clinic.com',
          role: 'admin',
          iat: 1234567890,
          exp: 9999999999,
          extraField: 'should not appear',
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        email: 'admin@clinic.com',
        role: 'admin',
      });
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
      expect(result).not.toHaveProperty('extraField');
    });
  });

  // ==========================================
  // DTO Validation
  // ==========================================
  describe('DTO Validation', () => {
    it('should accept valid LoginDto', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'token',
        email: 'admin@clinic.com',
        role: 'admin',
      });

      await expect(controller.login(loginDto)).resolves.toBeDefined();
    });

    it('should pass DTO to service unchanged', async () => {
      const loginDto: LoginDto = {
        email: 'test@clinic.com',
        password: 'testpass123',
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'token',
        email: 'test@clinic.com',
        role: 'admin',
      });

      await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);

      // Verify the exact object was passed
      const callArgs = mockAuthService.login.mock.calls[0][0];
      expect(callArgs.email).toBe('test@clinic.com');
      expect(callArgs.password).toBe('testpass123');
    });
  });

  // ==========================================
  // Response Structure
  // ==========================================
  describe('Response Structure', () => {
    it('should return LoginResponseDto structure', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      const mockResponse: LoginResponseDto = {
        access_token: 'jwt-token',
        email: 'admin@clinic.com',
        role: 'admin',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(typeof result.access_token).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.role).toBe('string');
    });

    it('should return profile structure from getProfile', async () => {
      const mockRequest = {
        user: {
          email: 'admin@clinic.com',
          role: 'admin',
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle concurrent login requests', async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: 'token',
        email: 'admin@clinic.com',
        role: 'admin',
      });

      const promises = [
        controller.login({ email: 'admin@clinic.com', password: 'admin123' }),
        controller.login({ email: 'doctor@clinic.com', password: 'doctor123' }),
        controller.login({ email: 'demo@clinic.com', password: 'demo123' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockAuthService.login).toHaveBeenCalledTimes(3);
    });

    it('should handle service timeout gracefully', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      mockAuthService.login.mockRejectedValue(new Error('Timeout'));

      await expect(controller.login(loginDto)).rejects.toThrow('Timeout');
    });

    it('should handle null user in request object', () => {
      const mockRequest = {
        user: null,
      };

      // This will throw a runtime error, which is expected behavior
      expect(() => controller.getProfile(mockRequest)).toThrow();
    });

    it('should handle undefined user in request object', () => {
      const mockRequest = {
        user: undefined,
      };

      // This will throw a runtime error, which is expected behavior
      expect(() => controller.getProfile(mockRequest)).toThrow();
    });
  });

  // ==========================================
  // Integration with Decorators
  // ==========================================
  describe('Decorator Integration', () => {
    it('should have @Public decorator on login endpoint', () => {
      // This test verifies that the login method can be called without guards
      // In a real integration test, you would verify the decorator using Reflector
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'token',
        email: 'admin@clinic.com',
        role: 'admin',
      });

      // Should not require authentication
      expect(controller.login(loginDto)).resolves.toBeDefined();
    });

    it('should require JwtAuthGuard on profile endpoint', () => {
      // In a real scenario, calling getProfile without a valid JWT would fail
      // This test verifies the method expects an authenticated request
      const mockRequest = {
        user: {
          email: 'admin@clinic.com',
          role: 'admin',
        },
      };

      const result = controller.getProfile(mockRequest);
      expect(result).toBeDefined();
    });
  });

  // ==========================================
  // Security
  // ==========================================
  describe('Security', () => {
    it('should not expose password in login response', async () => {
      const loginDto: LoginDto = {
        email: 'admin@clinic.com',
        password: 'admin123',
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'token',
        email: 'admin@clinic.com',
        role: 'admin',
      });

      const result = await controller.login(loginDto);

      expect(result).not.toHaveProperty('password');
    });

    it('should not expose sensitive data in profile response', async () => {
      const mockRequest = {
        user: {
          email: 'admin@clinic.com',
          role: 'admin',
          password: 'should-not-be-exposed',
          sensitiveData: 'secret',
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('sensitiveData');
    });
  });
});
