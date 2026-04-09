import { api } from './client';
import type { AuthResponse, RegisterInput, LoginInput } from '../types/api';

// Re-using names from Go/NestJS for consistency
export interface RegisterData extends RegisterInput {}
export interface LoginData extends LoginInput {}

export const authService = {
  register: (data: RegisterData) => 
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: LoginData) => 
    api.post<AuthResponse>('/auth/login', data),
  
  getProfile: () => 
    api.get<any>('/auth/profile'),
};
