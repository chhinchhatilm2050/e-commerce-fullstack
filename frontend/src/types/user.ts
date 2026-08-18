
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

export interface MeResponse {
  status: boolean
  data: { user: User }
}

export interface UpdateProfileRequest {
  gender: 'male' | 'female' | 'other' | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UpdateProfilePayload {  
  data: { user: User};
  message: string
}
