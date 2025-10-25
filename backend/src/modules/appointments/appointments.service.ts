import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find();
  }

  async findOne(id: string): Promise<Appointment> {
    return this.appointmentsRepository.findOne({ where: { id } });
  }

  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentsRepository.create(appointmentData);
    return this.appointmentsRepository.save(appointment);
  }

  async update(id: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
    await this.appointmentsRepository.update(id, appointmentData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.appointmentsRepository.delete(id);
  }
}
