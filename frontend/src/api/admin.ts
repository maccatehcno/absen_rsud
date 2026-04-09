import { api } from './client';
import type { User } from '../types/api';

export const adminService = {
  // User Management
  createUser: (data: any) =>
    api.post<User>('/admin/users', data),

  getAllUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page)   q.append('page',   String(params.page));
    if (params?.limit)  q.append('limit',  String(params.limit));
    if (params?.search) q.append('search', params.search);
    const qs = q.toString();
    return api.get<{ data: User[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/admin/users${qs ? `?${qs}` : ''}`
    );
  },

  updateUser: (id: string, data: any) =>
    api.patch<User>(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<{ message: string }>(`/admin/users/${id}`),

  // Attendance Recap
  getAttendance: (params?: { date?: string; userId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.userId) query.append('userId', params.userId);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return api.get<any[]>(`/admin/attendance${qs ? `?${qs}` : ''}`);
  },

  // Dashboard Stats
  getStats: () =>
    api.get<any>('/admin/stats'),
};
