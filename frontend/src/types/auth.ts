export interface User {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other' | null;
  email: string;
  role: 'admin' | 'customer';
  status: 'active' | 'inactive' | 'blocked';
  avatar: string;
  createdAt: string;
  orders: number;
  totalSpent: number;
  phoneNumber: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  gender: 'male' | 'female' | 'other' | null,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  password: string,
  confirmPassword: string
}

export interface AuthResponse {
  token: string;
  message: string
}

export interface AdminCreateUser extends RegisterPayload {
  role: 'admin' | 'customer'
  status: 'active' | 'inactive'
}

export interface RegisterResponse {
  message: string
  user: User
}

export interface MeResponse {
  status: boolean
  data: { user: User }
}
