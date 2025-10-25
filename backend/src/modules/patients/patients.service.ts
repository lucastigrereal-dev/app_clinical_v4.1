import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find();
  }

  async findOne(id: string): Promise<Patient> {
    return this.patientsRepository.findOne({ where: { id } });
  }

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientsRepository.create(patientData);
    return this.patientsRepository.save(patient);
  }

  async update(id: string, patientData: Partial<Patient>): Promise<Patient> {
    await this.patientsRepository.update(id, patientData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.patientsRepository.delete(id);
  }
}
