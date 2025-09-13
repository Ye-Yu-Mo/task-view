import api from './api';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'creator' | 'executor';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'creator' | 'executor';
  created_at: string;
}

export interface RegisterResponse extends User {}

export interface LoginResponse {
  user: User;
  message: string;
}

// 用户注册
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return await api.post('/auth/register', data);
};

// 用户登录
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return await api.post('/auth/login', data);
};

// 健康检查
export const healthCheck = async () => {
  return await api.get('/health');
};