export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    user?: any;
  };
}

export interface User {
  user_id?: number;
  email: string;
  first_name: string;
  last_name: string;
}
