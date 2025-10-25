import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from './patients.service';
import { Patient, PatientStatus } from './entities/patient.entity';

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: Repository<Patient>;

  const mockPatient: Patient = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'João Silva',
    email: 'joao@test.com',
    phone: '11999999999',
    birthDate: new Date('1990-01-01'),
    cpf: '12345678900',
    address: 'Rua Teste, 123',
    status: PatientStatus.ACTIVE,
    medicalHistory: 'Histórico médico',
    allergies: 'Nenhuma',
    medications: 'Nenhum',
    assignedDoctor: null,
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
        PatientsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get<Repository<Patient>>(getRepositoryToken(Patient));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const patients = [mockPatient];
      mockRepository.find.mockResolvedValue(patients);

      const result = await service.findAll();

      expect(result).toEqual(patients);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no patients exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPatient);

      const result = await service.findOne(mockPatient.id);

      expect(result).toEqual(mockPatient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPatient.id },
      });
    });

    it('should return null when patient not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle invalid UUID format', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Invalid UUID'));

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        'Invalid UUID',
      );
    });
  });

  describe('create', () => {
    const createPatientData = {
      name: 'Maria Santos',
      email: 'maria@test.com',
      phone: '11988888888',
      birthDate: new Date('1985-05-15'),
      cpf: '98765432100',
    };

    it('should create a new patient', async () => {
      const newPatient = { ...mockPatient, ...createPatientData };
      mockRepository.create.mockReturnValue(newPatient);
      mockRepository.save.mockResolvedValue(newPatient);

      const result = await service.create(createPatientData);

      expect(mockRepository.create).toHaveBeenCalledWith(createPatientData);
      expect(mockRepository.save).toHaveBeenCalledWith(newPatient);
      expect(result).toEqual(newPatient);
    });

    it('should create patient with default status', async () => {
      const patientWithDefaults = {
        ...mockPatient,
        ...createPatientData,
        status: PatientStatus.ACTIVE,
      };
      mockRepository.create.mockReturnValue(patientWithDefaults);
      mockRepository.save.mockResolvedValue(patientWithDefaults);

      const result = await service.create(createPatientData);

      expect(result.status).toBe(PatientStatus.ACTIVE);
    });

    it('should handle duplicate email error', async () => {
      mockRepository.create.mockReturnValue(mockPatient);
      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';
      mockRepository.save.mockRejectedValue(duplicateError);

      await expect(service.create(createPatientData)).rejects.toThrow('duplicate key value');
    });

    it('should create patient with optional fields', async () => {
      const dataWithOptional = {
        ...createPatientData,
        address: 'Rua Nova, 456',
        medicalHistory: 'Diabetes',
        allergies: 'Penicilina',
      };
      const patientWithOptional = { ...mockPatient, ...dataWithOptional };
      mockRepository.create.mockReturnValue(patientWithOptional);
      mockRepository.save.mockResolvedValue(patientWithOptional);

      const result = await service.create(dataWithOptional);

      expect(result.address).toBe(dataWithOptional.address);
      expect(result.medicalHistory).toBe(dataWithOptional.medicalHistory);
      expect(result.allergies).toBe(dataWithOptional.allergies);
    });
  });

  describe('update', () => {
    const updateData = {
      name: 'João Silva Updated',
      phone: '11977777777',
    };

    it('should update a patient', async () => {
      const updatedPatient = { ...mockPatient, ...updateData };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedPatient);

      const result = await service.update(mockPatient.id, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockPatient.id,
        updateData,
      );
      expect(result).toEqual(updatedPatient);
    });

    it('should update patient status', async () => {
      const statusUpdate = { status: PatientStatus.INACTIVE };
      const updatedPatient = { ...mockPatient, status: PatientStatus.INACTIVE };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedPatient);

      const result = await service.update(mockPatient.id, statusUpdate);

      expect(result.status).toBe(PatientStatus.INACTIVE);
    });

    it('should update multiple fields at once', async () => {
      const multiUpdate = {
        phone: '11966666666',
        address: 'Rua Atualizada, 789',
        medications: 'Aspirina',
      };
      const updatedPatient = { ...mockPatient, ...multiUpdate };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedPatient);

      const result = await service.update(mockPatient.id, multiUpdate);

      expect(result.phone).toBe(multiUpdate.phone);
      expect(result.address).toBe(multiUpdate.address);
      expect(result.medications).toBe(multiUpdate.medications);
    });

    it('should handle non-existent patient update', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent-id', updateData);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a patient', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockPatient.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockPatient.id);
    });

    it('should handle deletion of non-existent patient', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await service.remove('non-existent-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle database errors on deletion', async () => {
      mockRepository.delete.mockRejectedValue(
        new Error('Foreign key constraint'),
      );

      await expect(service.remove(mockPatient.id)).rejects.toThrow(
        'Foreign key constraint',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long medical history', async () => {
      const longHistory = 'A'.repeat(10000);
      const dataWithLongHistory = {
        ...mockPatient,
        medicalHistory: longHistory,
      };
      mockRepository.create.mockReturnValue(dataWithLongHistory);
      mockRepository.save.mockResolvedValue(dataWithLongHistory);

      const result = await service.create(dataWithLongHistory);

      expect(result.medicalHistory.length).toBe(10000);
    });

    it('should handle special characters in name', async () => {
      const specialName = "O'Brien-Santos José Ñ";
      const dataWithSpecialChars = { ...mockPatient, name: specialName };
      mockRepository.create.mockReturnValue(dataWithSpecialChars);
      mockRepository.save.mockResolvedValue(dataWithSpecialChars);

      const result = await service.create(dataWithSpecialChars);

      expect(result.name).toBe(specialName);
    });

    it('should handle birthDate as Date object', async () => {
      const birthDate = new Date('2000-12-31');
      const dataWithDate = { ...mockPatient, birthDate };
      mockRepository.create.mockReturnValue(dataWithDate);
      mockRepository.save.mockResolvedValue(dataWithDate);

      const result = await service.create(dataWithDate);

      expect(result.birthDate).toEqual(birthDate);
    });
  });
});
