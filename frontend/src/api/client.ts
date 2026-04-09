import type { HttpResponse } from '../types/api';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<HttpResponse<T>> {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  let result: any;
  
  if (contentType && contentType.includes('application/json')) {
    result = await response.json();
  } else {
    result = { message: 'Unexpected response' };
  }
  
  if (!response.ok) {
    const message = Array.isArray(result?.message)
      ? result.message.join(', ')
      : result?.message || 'Something went wrong';
    throw new Error(message);
  }

  return {
    data: result as T,
    status: response.status,
    ok: response.ok,
    headers: response.headers,
  };
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => 
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: any, options?: RequestInit) => 
    request<T>(path, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: body instanceof FormData ? { ...options?.headers } : { 'Content-Type': 'application/json', ...options?.headers }
    }),
  patch: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    }),
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
