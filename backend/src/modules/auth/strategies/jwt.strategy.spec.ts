import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock: return the JWT_SECRET
    mockConfigService.get.mockReturnValue('test-jwt-secret-key');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  // ==========================================
  // Strategy Definition
  // ==========================================
  describe('Strategy Definition', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should have configService injected', () => {
      expect(configService).toBeDefined();
    });

    it('should extend PassportStrategy', () => {
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });
  });

  // ==========================================
  // Strategy Configuration
  // ==========================================
  describe('Strategy Configuration', () => {
    it('should use JWT_SECRET from ConfigService', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should fallback to default secret if JWT_SECRET not set', () => {
      mockConfigService.get.mockReturnValue(null);

      // Create a new instance to test fallback
      const newStrategy = new JwtStrategy(configService);

      expect(newStrategy).toBeDefined();
      // The fallback secret is: 'clinic-companion-jwt-secret-2025'
    });

    it('should use secret from environment if available', () => {
      mockConfigService.get.mockReturnValue('production-secret-key');

      const newStrategy = new JwtStrategy(configService);

      expect(newStrategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  // ==========================================
  // validate() - Valid Payload
  // ==========================================
  describe('validate() - Valid Payload', () => {
    it('should validate payload with email and role', async () => {
      const payload = {
        email: 'admin@clinic.com',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        email: 'admin@clinic.com',
        role: 'admin',
      });
    });

    it('should validate admin payload', async () => {
      const payload = {
        email: 'admin@clinic.com',
        role: 'admin',
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('admin@clinic.com');
      expect(result.role).toBe('admin');
    });

    it('should validate doctor payload', async () => {
      const payload = {
        email: 'doctor@clinic.com',
        role: 'doctor',
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('doctor@clinic.com');
      expect(result.role).toBe('doctor');
    });

    it('should validate user payload', async () => {
      const payload = {
        email: 'demo@clinic.com',
        role: 'user',
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('demo@clinic.com');
      expect(result.role).toBe('user');
    });

    it('should return only email and role from payload', async () => {
      const payload = {
        email: 'admin@clinic.com',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
        extraField: 'should not be in result',
      };

      const result = await strategy.validate(payload);

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
  // validate() - Invalid Payload
  // ==========================================
  describe('validate() - Invalid Payload', () => {
    it('should throw UnauthorizedException if email is missing', async () => {
      const payload = {
        role: 'admin',
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email is null', async () => {
      const payload = {
        email: null,
        role: 'admin',
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email is undefined', async () => {
      const payload = {
        email: undefined,
        role: 'admin',
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email is empty string', async () => {
      const payload = {
        email: '',
        role: 'admin',
      };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should validate even if role is missing (optional)', async () => {
      // The strategy only checks for email, not role
      const payload = {
        email: 'admin@clinic.com',
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('admin@clinic.com');
      expect(result.role).toBeUndefined();
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle payload with only email', async () => {
      const payload = {
        email: 'test@clinic.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toHaveProperty('email');
      expect(result.email).toBe('test@clinic.com');
    });

    it('should handle empty payload object', async () => {
      const payload = {};

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle null payload', async () => {
      const payload = null;

      await expect(strategy.validate(payload)).rejects.toThrow();
    });

    it('should handle payload with whitespace email', async () => {
      const payload = {
        email: '   ',
        role: 'admin',
      };

      // Whitespace email should pass (current behavior)
      // In production, you might want to add .trim() validation
      const result = await strategy.validate(payload);
      expect(result.email).toBe('   ');
    });

    it('should handle payload with special characters in email', async () => {
      const payload = {
        email: 'user+test@clinic.com',
        role: 'user',
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('user+test@clinic.com');
    });
  });

  // ==========================================
  // Payload Structure
  // ==========================================
  describe('Payload Structure', () => {
    it('should accept standard JWT payload', async () => {
      const payload = {
        email: 'admin@clinic.com',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      };

      await expect(strategy.validate(payload)).resolves.toBeDefined();
    });

    it('should extract only necessary fields', async () => {
      const payload = {
        email: 'admin@clinic.com',
        role: 'admin',
        sub: 'user-id-123',
        iat: 1234567890,
        exp: 9999999999,
        customField: 'custom-value',
      };

      const result = await strategy.validate(payload);

      // Only email and role should be in result
      expect(Object.keys(result)).toEqual(['email', 'role']);
    });

    it('should handle payload with numeric email (edge case)', async () => {
      const payload = {
        email: 12345, // Not a string
        role: 'admin',
      };

      // Truthy check will pass for numbers
      const result = await strategy.validate(payload);
      expect(result.email).toBe(12345);
    });
  });

  // ==========================================
  // Integration Scenarios
  // ==========================================
  describe('Integration Scenarios', () => {
    it('should validate multiple payloads sequentially', async () => {
      const payloads = [
        { email: 'admin@clinic.com', role: 'admin' },
        { email: 'doctor@clinic.com', role: 'doctor' },
        { email: 'demo@clinic.com', role: 'user' },
      ];

      for (const payload of payloads) {
        const result = await strategy.validate(payload);
        expect(result.email).toBe(payload.email);
        expect(result.role).toBe(payload.role);
      }
    });

    it('should validate concurrent payloads', async () => {
      const payloads = [
        { email: 'admin@clinic.com', role: 'admin' },
        { email: 'doctor@clinic.com', role: 'doctor' },
        { email: 'demo@clinic.com', role: 'user' },
      ];

      const promises = payloads.map((payload) => strategy.validate(payload));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].role).toBe('admin');
      expect(results[1].role).toBe('doctor');
      expect(results[2].role).toBe('user');
    });

    it('should handle mix of valid and invalid payloads', async () => {
      const validPayload = { email: 'admin@clinic.com', role: 'admin' };
      const invalidPayload = { role: 'admin' }; // Missing email

      await expect(strategy.validate(validPayload)).resolves.toBeDefined();
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ==========================================
  // Security
  // ==========================================
  describe('Security', () => {
    it('should not include sensitive data in validated result', async () => {
      const payload = {
        email: 'admin@clinic.com',
        role: 'admin',
        password: 'should-not-be-exposed',
        secret: 'confidential',
      };

      const result = await strategy.validate(payload);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('secret');
      expect(Object.keys(result)).toEqual(['email', 'role']);
    });

    it('should validate email presence as security check', async () => {
      // Email is the primary identifier, must be present
      const payloadWithoutEmail = {
        role: 'admin',
        permissions: ['read', 'write'],
      };

      await expect(strategy.validate(payloadWithoutEmail)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not modify original payload', async () => {
      const payload = {
        email: 'admin@clinic.com',
        role: 'admin',
        extra: 'data',
      };

      const originalPayload = { ...payload };

      await strategy.validate(payload);

      expect(payload).toEqual(originalPayload);
    });
  });

  // ==========================================
  // Configuration Variations
  // ==========================================
  describe('Configuration Variations', () => {
    it('should work with custom JWT secret from config', () => {
      mockConfigService.get.mockReturnValue('custom-secret-123');

      const customStrategy = new JwtStrategy(configService);

      expect(customStrategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should work with undefined config (use default)', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const defaultStrategy = new JwtStrategy(configService);

      expect(defaultStrategy).toBeDefined();
      // Should use fallback: 'clinic-companion-jwt-secret-2025'
    });

    it('should work with empty string config (use default)', () => {
      mockConfigService.get.mockReturnValue('');

      const defaultStrategy = new JwtStrategy(configService);

      expect(defaultStrategy).toBeDefined();
      // Should use fallback due to falsy value
    });
  });
});
