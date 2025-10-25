import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from './entities/appointment.entity';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let repository: Repository<Appointment>;

  const mockAppointment: Appointment = {
    id: '456e7890-e12b-34c5-d678-901234567890',
    scheduledDate: new Date('2025-02-01T10:00:00Z'),
    duration: 60,
    status: AppointmentStatus.SCHEDULED,
    type: AppointmentType.CONSULTATION,
    notes: 'First consultation',
    diagnosis: null,
    treatment: null,
    prescription: null,
    patient: null,
    doctor: null,
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
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    repository = module.get<Repository<Appointment>>(
      getRepositoryToken(Appointment),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of appointments', async () => {
      const appointments = [mockAppointment];
      mockRepository.find.mockResolvedValue(appointments);

      const result = await service.findAll();

      expect(result).toEqual(appointments);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no appointments exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne', () => {
    it('should return an appointment by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockAppointment);

      const result = await service.findOne(mockAppointment.id);

      expect(result).toEqual(mockAppointment);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAppointment.id },
      });
    });

    it('should return null when appointment not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle invalid UUID', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Invalid UUID format'));

      await expect(service.findOne('invalid-uuid')).rejects.toThrow();
    });
  });

  describe('create', () => {
    const createData = {
      scheduledDate: new Date('2025-03-15T14:30:00Z'),
      duration: 30,
      type: AppointmentType.FOLLOW_UP,
    };

    it('should create a new appointment', async () => {
      const newAppointment = { ...mockAppointment, ...createData };
      mockRepository.create.mockReturnValue(newAppointment);
      mockRepository.save.mockResolvedValue(newAppointment);

      const result = await service.create(createData);

      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(mockRepository.save).toHaveBeenCalledWith(newAppointment);
      expect(result).toEqual(newAppointment);
    });

    it('should create appointment with default status SCHEDULED', async () => {
      const appointmentWithDefaults = {
        ...mockAppointment,
        ...createData,
        status: AppointmentStatus.SCHEDULED,
      };
      mockRepository.create.mockReturnValue(appointmentWithDefaults);
      mockRepository.save.mockResolvedValue(appointmentWithDefaults);

      const result = await service.create(createData);

      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
    });

    it('should create consultation appointment', async () => {
      const consultationData = {
        ...createData,
        type: AppointmentType.CONSULTATION,
        duration: 60,
      };
      const consultation = { ...mockAppointment, ...consultationData };
      mockRepository.create.mockReturnValue(consultation);
      mockRepository.save.mockResolvedValue(consultation);

      const result = await service.create(consultationData);

      expect(result.type).toBe(AppointmentType.CONSULTATION);
      expect(result.duration).toBe(60);
    });

    it('should create emergency appointment', async () => {
      const emergencyData = {
        ...createData,
        type: AppointmentType.EMERGENCY,
        scheduledDate: new Date(),
      };
      const emergency = { ...mockAppointment, ...emergencyData };
      mockRepository.create.mockReturnValue(emergency);
      mockRepository.save.mockResolvedValue(emergency);

      const result = await service.create(emergencyData);

      expect(result.type).toBe(AppointmentType.EMERGENCY);
    });

    it('should create appointment with notes', async () => {
      const dataWithNotes = {
        ...createData,
        notes: 'Patient requested afternoon appointment',
      };
      const appointmentWithNotes = { ...mockAppointment, ...dataWithNotes };
      mockRepository.create.mockReturnValue(appointmentWithNotes);
      mockRepository.save.mockResolvedValue(appointmentWithNotes);

      const result = await service.create(dataWithNotes);

      expect(result.notes).toBe(dataWithNotes.notes);
    });

    it('should handle different appointment durations', async () => {
      const durations = [15, 30, 45, 60, 90, 120];

      for (const duration of durations) {
        const data = { ...createData, duration };
        const appointment = { ...mockAppointment, duration };
        mockRepository.create.mockReturnValue(appointment);
        mockRepository.save.mockResolvedValue(appointment);

        const result = await service.create(data);

        expect(result.duration).toBe(duration);
        jest.clearAllMocks();
      }
    });
  });

  describe('update', () => {
    const updateData = {
      status: AppointmentStatus.CONFIRMED,
      notes: 'Patient confirmed attendance',
    };

    it('should update an appointment', async () => {
      const updatedAppointment = { ...mockAppointment, ...updateData };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedAppointment);

      const result = await service.update(mockAppointment.id, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockAppointment.id,
        updateData,
      );
      expect(result).toEqual(updatedAppointment);
    });

    it('should update appointment status to CONFIRMED', async () => {
      const statusUpdate = { status: AppointmentStatus.CONFIRMED };
      const confirmed = { ...mockAppointment, status: AppointmentStatus.CONFIRMED };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(confirmed);

      const result = await service.update(mockAppointment.id, statusUpdate);

      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should update appointment status to IN_PROGRESS', async () => {
      const statusUpdate = { status: AppointmentStatus.IN_PROGRESS };
      const inProgress = { ...mockAppointment, status: AppointmentStatus.IN_PROGRESS };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(inProgress);

      const result = await service.update(mockAppointment.id, statusUpdate);

      expect(result.status).toBe(AppointmentStatus.IN_PROGRESS);
    });

    it('should update appointment status to COMPLETED with diagnosis', async () => {
      const completionData = {
        status: AppointmentStatus.COMPLETED,
        diagnosis: 'Patient showing good recovery',
        treatment: 'Continue current medication',
        prescription: 'Ibuprofen 400mg, 2x daily',
      };
      const completed = { ...mockAppointment, ...completionData };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(completed);

      const result = await service.update(mockAppointment.id, completionData);

      expect(result.status).toBe(AppointmentStatus.COMPLETED);
      expect(result.diagnosis).toBe(completionData.diagnosis);
      expect(result.treatment).toBe(completionData.treatment);
      expect(result.prescription).toBe(completionData.prescription);
    });

    it('should update appointment status to CANCELLED', async () => {
      const cancelData = {
        status: AppointmentStatus.CANCELLED,
        notes: 'Patient requested cancellation',
      };
      const cancelled = { ...mockAppointment, ...cancelData };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(cancelled);

      const result = await service.update(mockAppointment.id, cancelData);

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('should update appointment status to NO_SHOW', async () => {
      const noShowUpdate = { status: AppointmentStatus.NO_SHOW };
      const noShow = { ...mockAppointment, status: AppointmentStatus.NO_SHOW };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(noShow);

      const result = await service.update(mockAppointment.id, noShowUpdate);

      expect(result.status).toBe(AppointmentStatus.NO_SHOW);
    });

    it('should reschedule appointment', async () => {
      const rescheduleData = {
        scheduledDate: new Date('2025-04-01T15:00:00Z'),
        notes: 'Rescheduled by patient request',
      };
      const rescheduled = { ...mockAppointment, ...rescheduleData };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(rescheduled);

      const result = await service.update(mockAppointment.id, rescheduleData);

      expect(result.scheduledDate).toEqual(rescheduleData.scheduledDate);
    });

    it('should change appointment type', async () => {
      const typeChange = { type: AppointmentType.PROCEDURE };
      const changed = { ...mockAppointment, type: AppointmentType.PROCEDURE };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(changed);

      const result = await service.update(mockAppointment.id, typeChange);

      expect(result.type).toBe(AppointmentType.PROCEDURE);
    });

    it('should handle non-existent appointment update', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent-id', updateData);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete an appointment', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockAppointment.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockAppointment.id);
    });

    it('should handle deletion of non-existent appointment', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await service.remove('non-existent-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle database errors on deletion', async () => {
      mockRepository.delete.mockRejectedValue(new Error('Constraint violation'));

      await expect(service.remove(mockAppointment.id)).rejects.toThrow(
        'Constraint violation',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle appointment with very long notes', async () => {
      const longNotes = 'A'.repeat(5000);
      const dataWithLongNotes = { ...mockAppointment, notes: longNotes };
      mockRepository.create.mockReturnValue(dataWithLongNotes);
      mockRepository.save.mockResolvedValue(dataWithLongNotes);

      const result = await service.create(dataWithLongNotes);

      expect(result.notes.length).toBe(5000);
    });

    it('should handle appointment scheduled far in the future', async () => {
      const futureDate = new Date('2030-12-31T23:59:59Z');
      const futureAppointment = { ...mockAppointment, scheduledDate: futureDate };
      mockRepository.create.mockReturnValue(futureAppointment);
      mockRepository.save.mockResolvedValue(futureAppointment);

      const result = await service.create(futureAppointment);

      expect(result.scheduledDate).toEqual(futureDate);
    });

    it('should handle very short duration appointment', async () => {
      const shortDuration = { ...mockAppointment, duration: 5 };
      mockRepository.create.mockReturnValue(shortDuration);
      mockRepository.save.mockResolvedValue(shortDuration);

      const result = await service.create(shortDuration);

      expect(result.duration).toBe(5);
    });

    it('should handle all appointment types', async () => {
      const types = [
        AppointmentType.CONSULTATION,
        AppointmentType.FOLLOW_UP,
        AppointmentType.PROCEDURE,
        AppointmentType.EMERGENCY,
      ];

      for (const type of types) {
        const data = { ...mockAppointment, type };
        mockRepository.create.mockReturnValue(data);
        mockRepository.save.mockResolvedValue(data);

        const result = await service.create(data);

        expect(result.type).toBe(type);
        jest.clearAllMocks();
      }
    });

    it('should handle all appointment statuses', async () => {
      const statuses = [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ];

      for (const status of statuses) {
        const data = { ...mockAppointment, status };
        mockRepository.update.mockResolvedValue({ affected: 1 });
        mockRepository.findOne.mockResolvedValue(data);

        const result = await service.update(mockAppointment.id, { status });

        expect(result.status).toBe(status);
        jest.clearAllMocks();
      }
    });
  });
});
