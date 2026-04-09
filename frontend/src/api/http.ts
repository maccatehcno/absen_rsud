// HTTP helper utilities for PATCH and DELETE requests

export const api_delete = async <T = any>(url: string): Promise<{ data: T }> => {
  const token = localStorage.getItem('access_token');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return { data };
};

export const api_patch = async <T = any>(url: string, body: any): Promise<{ data: T }> => {
  const token = localStorage.getItem('access_token');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api${url}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return { data };
};
