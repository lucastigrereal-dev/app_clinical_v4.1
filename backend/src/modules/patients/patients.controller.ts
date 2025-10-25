import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create patient', description: 'Cria um novo paciente no sistema' })
  @ApiResponse({ status: 201, description: 'Patient created successfully.', type: Patient })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients', description: 'Lista todos os pacientes cadastrados' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully.', type: [Patient] })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by id', description: 'Busca um paciente específico pelo ID' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully.', type: Patient })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient', description: 'Atualiza dados de um paciente existente' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully.', type: Patient })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient', description: 'Remove um paciente do sistema' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
