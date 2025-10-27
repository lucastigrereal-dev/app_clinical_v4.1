// backend/src/auth/seed.controller.ts
// TEMPORARY: One-time seed endpoint (remove after use)
import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Public } from '../modules/auth/decorators/public.decorator';
import * as bcrypt from 'bcrypt';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Post('admin')
  @Public()
  @ApiOperation({
    summary: 'ONE-TIME: Create admin user (PUBLIC - remove after use)',
    description: 'Creates admin user: admin@clinic.com / Admin@123'
  })
  async seedAdmin() {
    // Check if admin exists
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: 'admin@clinic.com' }
    });

    if (existingAdmin) {
      return {
        success: true,
        message: 'Admin user already exists',
        email: 'admin@clinic.com',
        created: false
      };
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const admin = this.usersRepository.create({
      email: 'admin@clinic.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'admin'
    });

    await this.usersRepository.save(admin);

    return {
      success: true,
      message: 'Admin user created successfully',
      email: 'admin@clinic.com',
      password: 'Admin@123',
      created: true,
      warning: 'REMOVE THIS ENDPOINT AFTER USE!'
    };
  }
}
