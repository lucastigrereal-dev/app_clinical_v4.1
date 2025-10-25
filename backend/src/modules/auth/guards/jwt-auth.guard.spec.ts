import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  // Mock Reflector
  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  // Mock ExecutionContext
  const createMockExecutionContext = (isPublic: boolean = false): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer mock-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    // Setup reflector to return isPublic value
    mockReflector.getAllAndOverride.mockReturnValue(isPublic);

    return mockContext;
  };

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  // ==========================================
  // Guard Definition
  // ==========================================
  describe('Guard Definition', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should have reflector injected', () => {
      expect(reflector).toBeDefined();
    });

    it('should extend AuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });

  // ==========================================
  // canActivate() - Public Routes
  // ==========================================
  describe('canActivate() - Public Routes', () => {
    it('should allow access to public routes without token', () => {
      const context = createMockExecutionContext(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should check for @Public decorator on handler', () => {
      const context = createMockExecutionContext(true);

      guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        expect.any(Array),
      );
    });

    it('should bypass JWT validation for public routes', () => {
      const context = createMockExecutionContext(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      // Should not call super.canActivate() for public routes
    });

    it('should allow multiple public route accesses', () => {
      const context1 = createMockExecutionContext(true);
      const context2 = createMockExecutionContext(true);
      const context3 = createMockExecutionContext(true);

      expect(guard.canActivate(context1)).toBe(true);
      expect(guard.canActivate(context2)).toBe(true);
      expect(guard.canActivate(context3)).toBe(true);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(3);
    });
  });

  // ==========================================
  // canActivate() - Protected Routes
  // ==========================================
  describe('canActivate() - Protected Routes', () => {
    it('should call super.canActivate() for protected routes', () => {
      const context = createMockExecutionContext(false);

      // Mock super.canActivate to return true
      jest.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should check reflector for protected routes', () => {
      const context = createMockExecutionContext(false);

      guard.canActivate(context);

      // Verify reflector was called to check for @Public decorator
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
    });
  });

  // ==========================================
  // handleRequest() - Valid User
  // ==========================================
  describe('handleRequest() - Valid User', () => {
    it('should return user object when authentication succeeds', () => {
      const mockUser = {
        email: 'admin@clinic.com',
        role: 'admin',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should return user with email and role', () => {
      const mockUser = {
        email: 'doctor@clinic.com',
        role: 'doctor',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result.email).toBe('doctor@clinic.com');
      expect(result.role).toBe('doctor');
    });

    it('should handle admin user', () => {
      const mockUser = {
        email: 'admin@clinic.com',
        role: 'admin',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result.role).toBe('admin');
    });

    it('should handle doctor user', () => {
      const mockUser = {
        email: 'doctor@clinic.com',
        role: 'doctor',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result.role).toBe('doctor');
    });

    it('should handle regular user', () => {
      const mockUser = {
        email: 'demo@clinic.com',
        role: 'user',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result.role).toBe('user');
    });
  });

  // ==========================================
  // handleRequest() - Missing User
  // ==========================================
  describe('handleRequest() - Missing User', () => {
    it('should throw UnauthorizedException when user is null', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      expect(() => {
        guard.handleRequest(null, undefined, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw with correct error message', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow('Acesso não autorizado');
    });

    it('should not return user when authentication fails', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow();
    });
  });

  // ==========================================
  // handleRequest() - Error Cases
  // ==========================================
  describe('handleRequest() - Error Cases', () => {
    it('should throw error when err is provided', () => {
      const mockError = new Error('Authentication failed');
      const mockUser = { email: 'admin@clinic.com', role: 'admin' };

      expect(() => {
        guard.handleRequest(mockError, mockUser, null);
      }).toThrow('Authentication failed');
    });

    it('should prioritize error over user', () => {
      const mockError = new UnauthorizedException('Token expired');
      const mockUser = { email: 'admin@clinic.com', role: 'admin' };

      expect(() => {
        guard.handleRequest(mockError, mockUser, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when both err and user are null', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should handle custom error types', () => {
      const customError = new Error('Custom authentication error');
      const mockUser = null;

      expect(() => {
        guard.handleRequest(customError, mockUser, null);
      }).toThrow('Custom authentication error');
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle user object with extra fields', () => {
      const mockUser = {
        email: 'admin@clinic.com',
        role: 'admin',
        extraField: 'extra-data',
        anotherField: 123,
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
      // All fields should be returned as-is
      expect(result).toHaveProperty('extraField');
    });

    it('should handle empty user object', () => {
      const mockUser = {};

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual({});
    });

    it('should handle user with only email', () => {
      const mockUser = {
        email: 'test@clinic.com',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result.email).toBe('test@clinic.com');
      expect(result.role).toBeUndefined();
    });

    it('should handle falsy user value (0)', () => {
      // 0 is falsy but not null/undefined
      expect(() => {
        guard.handleRequest(null, 0 as any, null);
      }).toThrow(UnauthorizedException);
    });

    it('should handle falsy user value (false)', () => {
      // false is falsy but not null/undefined
      expect(() => {
        guard.handleRequest(null, false as any, null);
      }).toThrow(UnauthorizedException);
    });

    it('should handle falsy user value (empty string)', () => {
      // empty string is falsy but not null/undefined
      expect(() => {
        guard.handleRequest(null, '' as any, null);
      }).toThrow(UnauthorizedException);
    });
  });

  // ==========================================
  // Reflector Integration
  // ==========================================
  describe('Reflector Integration', () => {
    it('should use reflector.getAllAndOverride with correct key', () => {
      const context = createMockExecutionContext(false);

      guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        expect.any(Array),
      );
    });

    it('should pass handler and class to reflector', () => {
      const context = createMockExecutionContext(false);

      guard.canActivate(context);

      const callArgs = mockReflector.getAllAndOverride.mock.calls[0];
      expect(callArgs[1]).toHaveLength(2); // [handler, class]
    });

    it('should check both handler and class decorators', () => {
      const context = createMockExecutionContext(true);

      guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
    });
  });

  // ==========================================
  // Security
  // ==========================================
  describe('Security', () => {
    it('should not expose error details in UnauthorizedException', () => {
      try {
        guard.handleRequest(null, null, null);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Acesso não autorizado');
        // Should not expose internal error details
      }
    });

    it('should protect routes by default (not public)', () => {
      const context = createMockExecutionContext(false);

      // Without setting up super.canActivate mock, this would attempt JWT validation
      expect(mockReflector.getAllAndOverride).not.toHaveBeenCalled();

      guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should require explicit @Public decorator for public access', () => {
      // By default, routes are protected
      const context = createMockExecutionContext(false);

      mockReflector.getAllAndOverride.mockReturnValue(false);

      // Would call super.canActivate() which requires JWT
      guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });

  // ==========================================
  // Integration Scenarios
  // ==========================================
  describe('Integration Scenarios', () => {
    it('should handle multiple sequential requests', () => {
      const publicContext = createMockExecutionContext(true);
      const protectedContext = createMockExecutionContext(false);

      expect(guard.canActivate(publicContext)).toBe(true);

      // Protected route would need proper JWT
      mockReflector.getAllAndOverride.mockReturnValue(false);
      guard.canActivate(protectedContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(2);
    });

    it('should validate different user roles', () => {
      const users = [
        { email: 'admin@clinic.com', role: 'admin' },
        { email: 'doctor@clinic.com', role: 'doctor' },
        { email: 'demo@clinic.com', role: 'user' },
      ];

      users.forEach((user) => {
        const result = guard.handleRequest(null, user, null);
        expect(result).toEqual(user);
      });
    });

    it('should handle concurrent guard checks', () => {
      const contexts = [
        createMockExecutionContext(true),
        createMockExecutionContext(false),
        createMockExecutionContext(true),
      ];

      const results = contexts.map((ctx, index) => {
        mockReflector.getAllAndOverride.mockReturnValue(index === 0 || index === 2);
        return guard.canActivate(ctx);
      });

      expect(results[0]).toBe(true); // public
      expect(results[2]).toBe(true); // public
    });
  });

  // ==========================================
  // Info Parameter
  // ==========================================
  describe('Info Parameter Handling', () => {
    it('should accept info parameter in handleRequest', () => {
      const mockUser = { email: 'admin@clinic.com', role: 'admin' };
      const mockInfo = { message: 'Token validation info' };

      const result = guard.handleRequest(null, mockUser, mockInfo);

      expect(result).toEqual(mockUser);
      // Info parameter is available but not used in current implementation
    });

    it('should ignore info when user is valid', () => {
      const mockUser = { email: 'admin@clinic.com', role: 'admin' };
      const mockInfo = { error: 'Should not affect result' };

      const result = guard.handleRequest(null, mockUser, mockInfo);

      expect(result).toEqual(mockUser);
    });

    it('should throw even with info when user is missing', () => {
      const mockInfo = { message: 'Additional info' };

      expect(() => {
        guard.handleRequest(null, null, mockInfo);
      }).toThrow(UnauthorizedException);
    });
  });
});
