export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other' | null;
  email: string;
  role: 'admin' | 'customer';
  status: 'active' | 'inactive' | 'blocked';
  avatar: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  phoneNumber: string;
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
  accessToken: string;
  message: string
  user: User
}

export interface AdminCreateUser extends RegisterPayload {
  role: 'admin' | 'customer'
  status: 'active' | 'inactive'
}

export interface RegisterResponse {
  message: string
  user: User
}

