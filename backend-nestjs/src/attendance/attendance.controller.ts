import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Request, 
  Get,
  BadRequestException
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('check-in')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/attendance';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `checkin-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async checkIn(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { latitude: string; longitude: string },
  ) {
    if (!file) {
      throw new BadRequestException('Foto selfie diperlukan untuk absensi masuk.');
    }

    return this.attendanceService.checkIn(req.user.userId, {
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      photoPath: file.path,
    });
  }

  @Post('check-out')
  async checkOut(
    @Request() req: any,
    @Body() body: { latitude: string; longitude: string },
  ) {
    return this.attendanceService.checkOut(req.user.userId, {
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
    });
  }

  @Get('history')
  async getMyAttendance(@Request() req: any) {
    return this.attendanceService.getMyAttendance(req.user.userId);
  }
}
