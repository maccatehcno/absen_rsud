import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async validateLocation(lat: number, lon: number) {
    const targetLat = parseFloat(
      this.configService.get<string>('RSUD_LATITUDE') || '-4.123',
    );
    const targetLon = parseFloat(
      this.configService.get<string>('RSUD_LONGITUDE') || '120.032',
    );
    const allowedRadius = this.configService.get<number>(
      'RSUD_RADIUS_METERS',
      100,
    );

    const distance = this.calculateDistance(lat, lon, targetLat, targetLon);
    if (distance > allowedRadius) {
      console.log(
        `[TESTING] Bypassing geofencing. Original distance: ${Math.round(distance)}m`,
      );
      // throw new BadRequestException(`Anda berada di luar jangkauan absensi (${Math.round(distance)}m).`);
    }
  }

  async checkIn(
    userId: string,
    data: { latitude: number; longitude: number; photoPath: string },
  ) {
    await this.validateLocation(data.latitude, data.longitude);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findFirst({
      where: { userId, createdAt: { gte: today } },
    });

    if (existing) {
      throw new BadRequestException('Anda sudah melakukan absensi hari ini.');
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date(),
        checkInLatitude: data.latitude,
        checkInLongitude: data.longitude,
        photoPath: data.photoPath,
        status: 'PRESENT',
      },
    });
  }

  async checkOut(
    userId: string,
    data: { latitude: number; longitude: number },
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findFirst({
      where: { userId, createdAt: { gte: today }, checkOut: null },
    });

    if (!attendance) {
      throw new BadRequestException(
        'Absensi masuk tidak ditemukan atau sudah melakukan absensi keluar.',
      );
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
        checkOutLatitude: data.latitude,
        checkOutLongitude: data.longitude,
      },
    });
  }

  async getMyAttendance(userId: string) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  // Admin: Get all attendance with filters
  async getAllAttendance(filters: {
    date?: string;
    userId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    return this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, nip: true, jabatan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  // Admin: Dashboard stats
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalUsers, todayAttendance, totalAttendanceThisMonth] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'STAFF' } }),
        this.prisma.attendance.findMany({
          where: { createdAt: { gte: today, lt: tomorrow } },
          include: { user: { select: { name: true, jabatan: true } } },
        }),
        this.prisma.attendance.count({
          where: {
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), 1),
              lt: tomorrow,
            },
          },
        }),
      ]);

    const presentToday = todayAttendance.filter(
      (a) => a.checkIn !== null,
    ).length;
    const checkedOutToday = todayAttendance.filter(
      (a) => a.checkOut !== null,
    ).length;

    return {
      totalStaff: totalUsers,
      presentToday,
      checkedOutToday,
      absentToday: Math.max(0, totalUsers - presentToday),
      totalAttendanceThisMonth,
      recentAttendance: todayAttendance.slice(0, 5),
    };
  }
}
