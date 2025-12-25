export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'veterinarian';
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    refresh_token?: string;
    user?: User;
  };
}

export interface User {
  id?: number;
  email: string;
  name: string;
  role?: 'admin' | 'user' | 'veterinarian';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}
