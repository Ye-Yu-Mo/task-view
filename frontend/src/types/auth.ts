export type UserRole = 'creator' | 'executor';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

export interface FormError {
  field: string;
  message: string;
}