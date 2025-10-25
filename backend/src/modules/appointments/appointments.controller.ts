import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create appointment', description: 'Cria uma nova consulta/agendamento' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully.', type: Appointment })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments', description: 'Lista todas as consultas agendadas' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully.', type: [Appointment] })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by id', description: 'Busca uma consulta específica pelo ID' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully.', type: Appointment })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment', description: 'Atualiza dados de uma consulta existente' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully.', type: Appointment })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment', description: 'Remove uma consulta do sistema' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
