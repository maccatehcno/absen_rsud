import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [UsersModule, AttendanceModule],
  controllers: [AdminController],
})
export class AdminModule {}
