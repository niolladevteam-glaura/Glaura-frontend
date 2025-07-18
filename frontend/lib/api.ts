// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userApi = {
  getAllUsers: async () => {
    const response = await api.get('/user');
    return response.data;
  },
  
  getUserById: async (id: string) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },
  
getUserPermissions: async (userId: string) => {
    try {
      const response = await api.get(`/permission/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return { 
        success: false, 
        message: "Failed to fetch permissions",
        userPermissions: {} 
      };
    }
  },

  createUser: async (userData: any) => {
    const response = await api.post('/user', userData);
    return response.data;
  },
  
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  },
  
  toggleUserStatus: async (id: string, status: boolean) => {
    const response = await api.put(`/user/${id}`, { status });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },
  
  // Auth endpoints
  signin: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },
};