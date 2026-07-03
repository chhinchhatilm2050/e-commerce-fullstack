export interface LoginBody {
  email: string;
  password: string;
}

export interface VerifyEmailBody {
  email: string;
  code: string
}

export interface CreateUserBody {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
}