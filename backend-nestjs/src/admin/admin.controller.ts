import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AttendanceService } from '../attendance/attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private usersService: UsersService,
    private attendanceService: AttendanceService,
  ) {}

  // --- User Management ---
  @Post('users')
  async createUser(@Body() data: any) {
    return this.usersService.create(data);
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search ?? '',
    );
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'Pengguna berhasil dihapus.' };
  }

  // --- Attendance Management ---
  @Get('attendance')
  async getAllAttendance(
    @Query('date') date?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.attendanceService.getAllAttendance({ date, userId, status });
  }

  // --- Dashboard Stats ---
  @Get('stats')
  async getDashboardStats() {
    return this.attendanceService.getDashboardStats();
  }
}
