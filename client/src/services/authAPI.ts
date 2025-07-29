import axios from 'axios';
import { User } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with token management
const authAPI = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token to requests
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  login: async (emailOrUsername: string, password: string): Promise<LoginResponse> => {
    const response = await authAPI.post('/auth/login', {
      emailOrUsername,
      password
    });
    return response.data;
  },

  register: async (username: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await authAPI.post('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await authAPI.get(`/auth/check-username/${username}`);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await authAPI.get('/auth/profile');
    return response.data;
  }
};