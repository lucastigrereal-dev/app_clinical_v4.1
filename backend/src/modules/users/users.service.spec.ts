import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: '789e0123-e45f-67g8-h901-234567890123',
    email: 'doctor@clinic.com',
    password: '$2b$10$hashedpassword',
    name: 'Dr. Silva',
    phone: '11999999999',
    role: UserRole.DOCTOR,
    isActive: true,
    lastLogin: new Date('2025-01-20T10:00:00Z'),
    mfaSecret: null,
    mfaEnabled: false,
    patients: [],
    appointments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should return users with different roles', async () => {
      const users = [
        { ...mockUser, role: UserRole.ADMIN },
        { ...mockUser, role: UserRole.DOCTOR },
        { ...mockUser, role: UserRole.NURSE },
        { ...mockUser, role: UserRole.STAFF },
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(4);
      expect(result.map((u) => u.role)).toEqual([
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.NURSE,
        UserRole.STAFF,
      ]);
    });

    it('should handle database errors', async () => {
      mockRepository.find.mockRejectedValue(new Error('Connection timeout'));

      await expect(service.findAll()).rejects.toThrow('Connection timeout');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle invalid UUID', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Invalid UUID'));

      await expect(service.findOne('invalid-uuid')).rejects.toThrow('Invalid UUID');
    });
  });

  describe('create', () => {
    const createUserData = {
      email: 'nurse@clinic.com',
      password: '$2b$10$hashedpassword2',
      name: 'Nurse Maria',
      role: UserRole.NURSE,
    };

    it('should create a new user', async () => {
      const newUser = { ...mockUser, ...createUserData };
      mockRepository.create.mockReturnValue(newUser);
      mockRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserData);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserData);
      expect(mockRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should create admin user', async () => {
      const adminData = {
        ...createUserData,
        email: 'admin@clinic.com',
        role: UserRole.ADMIN,
      };
      const admin = { ...mockUser, ...adminData };
      mockRepository.create.mockReturnValue(admin);
      mockRepository.save.mockResolvedValue(admin);

      const result = await service.create(adminData);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should create doctor user', async () => {
      const doctorData = {
        ...createUserData,
        email: 'doctor2@clinic.com',
        role: UserRole.DOCTOR,
      };
      const doctor = { ...mockUser, ...doctorData };
      mockRepository.create.mockReturnValue(doctor);
      mockRepository.save.mockResolvedValue(doctor);

      const result = await service.create(doctorData);

      expect(result.role).toBe(UserRole.DOCTOR);
    });

    it('should create staff user', async () => {
      const staffData = {
        ...createUserData,
        email: 'staff@clinic.com',
        role: UserRole.STAFF,
      };
      const staff = { ...mockUser, ...staffData };
      mockRepository.create.mockReturnValue(staff);
      mockRepository.save.mockResolvedValue(staff);

      const result = await service.create(staffData);

      expect(result.role).toBe(UserRole.STAFF);
    });

    it('should create user with default isActive=true', async () => {
      const userWithDefaults = { ...mockUser, ...createUserData, isActive: true };
      mockRepository.create.mockReturnValue(userWithDefaults);
      mockRepository.save.mockResolvedValue(userWithDefaults);

      const result = await service.create(createUserData);

      expect(result.isActive).toBe(true);
    });

    it('should create user with phone number', async () => {
      const dataWithPhone = {
        ...createUserData,
        phone: '11988888888',
      };
      const userWithPhone = { ...mockUser, ...dataWithPhone };
      mockRepository.create.mockReturnValue(userWithPhone);
      mockRepository.save.mockResolvedValue(userWithPhone);

      const result = await service.create(dataWithPhone);

      expect(result.phone).toBe(dataWithPhone.phone);
    });

    it('should handle duplicate email error', async () => {
      mockRepository.create.mockReturnValue(mockUser);
      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';
      mockRepository.save.mockRejectedValue(duplicateError);

      await expect(service.create(createUserData)).rejects.toThrow('duplicate key value');
    });

    it('should create user with MFA disabled by default', async () => {
      const userNoMFA = {
        ...mockUser,
        ...createUserData,
        mfaEnabled: false,
        mfaSecret: null,
      };
      mockRepository.create.mockReturnValue(userNoMFA);
      mockRepository.save.mockResolvedValue(userNoMFA);

      const result = await service.create(createUserData);

      expect(result.mfaEnabled).toBe(false);
      expect(result.mfaSecret).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = {
      name: 'Dr. Silva Updated',
      phone: '11977777777',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should activate a user', async () => {
      const activateData = { isActive: true };
      const activeUser = { ...mockUser, isActive: true };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(activeUser);

      const result = await service.update(mockUser.id, activateData);

      expect(result.isActive).toBe(true);
    });

    it('should deactivate a user', async () => {
      const deactivateData = { isActive: false };
      const inactiveUser = { ...mockUser, isActive: false };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(inactiveUser);

      const result = await service.update(mockUser.id, deactivateData);

      expect(result.isActive).toBe(false);
    });

    it('should update user role', async () => {
      const roleUpdate = { role: UserRole.ADMIN };
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(adminUser);

      const result = await service.update(mockUser.id, roleUpdate);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should update lastLogin timestamp', async () => {
      const loginTime = new Date('2025-01-21T15:30:00Z');
      const loginUpdate = { lastLogin: loginTime };
      const loggedUser = { ...mockUser, lastLogin: loginTime };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(loggedUser);

      const result = await service.update(mockUser.id, loginUpdate);

      expect(result.lastLogin).toEqual(loginTime);
    });

    it('should enable MFA for user', async () => {
      const mfaData = {
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      };
      const mfaUser = { ...mockUser, ...mfaData };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mfaUser);

      const result = await service.update(mockUser.id, mfaData);

      expect(result.mfaEnabled).toBe(true);
      expect(result.mfaSecret).toBe(mfaData.mfaSecret);
    });

    it('should disable MFA for user', async () => {
      const disableMFA = {
        mfaEnabled: false,
        mfaSecret: null,
      };
      const noMfaUser = { ...mockUser, ...disableMFA };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(noMfaUser);

      const result = await service.update(mockUser.id, disableMFA);

      expect(result.mfaEnabled).toBe(false);
      expect(result.mfaSecret).toBeNull();
    });

    it('should update password', async () => {
      const passwordUpdate = { password: '$2b$10$newhash' };
      const updatedPassUser = { ...mockUser, password: '$2b$10$newhash' };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedPassUser);

      const result = await service.update(mockUser.id, passwordUpdate);

      expect(result.password).toBe(passwordUpdate.password);
    });

    it('should update multiple fields at once', async () => {
      const multiUpdate = {
        name: 'Dr. João Silva',
        phone: '11966666666',
        role: UserRole.ADMIN,
        isActive: true,
      };
      const multiUpdatedUser = { ...mockUser, ...multiUpdate };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(multiUpdatedUser);

      const result = await service.update(mockUser.id, multiUpdate);

      expect(result.name).toBe(multiUpdate.name);
      expect(result.phone).toBe(multiUpdate.phone);
      expect(result.role).toBe(multiUpdate.role);
      expect(result.isActive).toBe(multiUpdate.isActive);
    });

    it('should handle non-existent user update', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent-id', updateData);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockUser.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle deletion of non-existent user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await service.remove('non-existent-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle foreign key constraint errors', async () => {
      const fkError = new Error('foreign key constraint violation');
      (fkError as any).code = '23503';
      mockRepository.delete.mockRejectedValue(fkError);

      await expect(service.remove(mockUser.id)).rejects.toThrow('foreign key constraint');
    });
  });

  describe('User Roles', () => {
    it('should handle all user roles', async () => {
      const roles = [
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.NURSE,
        UserRole.STAFF,
      ];

      for (const role of roles) {
        const user = { ...mockUser, role };
        mockRepository.create.mockReturnValue(user);
        mockRepository.save.mockResolvedValue(user);

        const result = await service.create({ ...mockUser, role });

        expect(result.role).toBe(role);
        jest.clearAllMocks();
      }
    });

    it('should create users with different permission levels', async () => {
      const users = [
        { ...mockUser, email: 'admin@test.com', role: UserRole.ADMIN },
        { ...mockUser, email: 'doctor@test.com', role: UserRole.DOCTOR },
        { ...mockUser, email: 'nurse@test.com', role: UserRole.NURSE },
        { ...mockUser, email: 'staff@test.com', role: UserRole.STAFF },
      ];

      for (const userData of users) {
        mockRepository.create.mockReturnValue(userData);
        mockRepository.save.mockResolvedValue(userData);

        const result = await service.create(userData);

        expect(result.email).toBe(userData.email);
        expect(result.role).toBe(userData.role);
        jest.clearAllMocks();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long names', async () => {
      const longName = 'A'.repeat(255);
      const userWithLongName = { ...mockUser, name: longName };
      mockRepository.create.mockReturnValue(userWithLongName);
      mockRepository.save.mockResolvedValue(userWithLongName);

      const result = await service.create(userWithLongName);

      expect(result.name.length).toBe(255);
    });

    it('should handle special characters in email', async () => {
      const specialEmail = "user+test@clinic.com";
      const userSpecialEmail = { ...mockUser, email: specialEmail };
      mockRepository.create.mockReturnValue(userSpecialEmail);
      mockRepository.save.mockResolvedValue(userSpecialEmail);

      const result = await service.create(userSpecialEmail);

      expect(result.email).toBe(specialEmail);
    });

    it('should handle international phone numbers', async () => {
      const intlPhone = '+55 11 99999-9999';
      const userIntlPhone = { ...mockUser, phone: intlPhone };
      mockRepository.create.mockReturnValue(userIntlPhone);
      mockRepository.save.mockResolvedValue(userIntlPhone);

      const result = await service.create(userIntlPhone);

      expect(result.phone).toBe(intlPhone);
    });

    it('should handle MFA secret with special characters', async () => {
      const complexSecret = 'JBSWY3DPEHPK3PXP==';
      const mfaUpdate = { mfaSecret: complexSecret, mfaEnabled: true };
      const mfaUser = { ...mockUser, ...mfaUpdate };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mfaUser);

      const result = await service.update(mockUser.id, mfaUpdate);

      expect(result.mfaSecret).toBe(complexSecret);
    });

    it('should preserve timestamps on update', async () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const updatedAt = new Date('2025-01-20T12:00:00Z');
      const userWithTimestamps = {
        ...mockUser,
        name: 'Updated Name',
        createdAt,
        updatedAt,
      };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(userWithTimestamps);

      const result = await service.update(mockUser.id, { name: 'Updated Name' });

      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
    });
  });
});
