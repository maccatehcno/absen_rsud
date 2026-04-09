import { api } from './client';
import type { Attendance } from '../types/api';

export const attendanceService = {
  checkIn: (latitude: number, longitude: number, photo: File) => {
    const formData = new FormData();
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('photo', photo);
    
    return api.post<Attendance>('/attendance/check-in', formData);
  },

  checkOut: (latitude: number, longitude: number) => 
    api.post<Attendance>('/attendance/check-out', { latitude, longitude }),

  getHistory: () => 
    api.get<Attendance[]>('/attendance/history'),
};
