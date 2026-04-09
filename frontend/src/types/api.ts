export interface LoginInput {
  nip: string;
  password?: string; // Optional for some cases, but usually present
}

export interface RegisterInput {
  nip: string;
  nik: string;
  name: string;
  email: string;
  jabatan: string;
  password: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
  headers: Headers;
}

export const Role = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF'
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  nip: string;
  nik: string;
  name: string;
  email: string;
  jabatan: string;
  role: Role;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    access_token: string;
  };
}

export interface Attendance {
  id: string;
  userId: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  photoPath: string | null;
  createdAt: string;
}
