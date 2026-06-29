import UserModel from '../model/user.js';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
import { IUser } from '../model/user.js';
import { sendVerificationEmail } from '../utils/email.js';
import { 
  generateVerificationCode,
  hashVerificationCode,
  compareVerificationCode,
  CODE_EXPIRY_MINUTES,
  MAX_VERIFICATION_ATTEMPTS
} from '../utils/verificationCode.js';

interface CreateUserBody {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
}

type UpdateUserBody = Partial<Omit<CreateUserBody, 'password'>>;

export const createUser = asyncHandler(async(req: Request<unknown, unknown, CreateUserBody>, res: Response, next: NextFunction): Promise<void> => {
  const { firstName, lastName,phoneNumber, email, password, gender } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    if(existingUser.isVerified) {
      return next(new AppError('This email already in use', 409));
    }
    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.phoneNumber = phoneNumber;
    existingUser.password = password;
    existingUser.gender = gender;

    const code = generateVerificationCode();
    existingUser.verificationCodeHash = await hashVerificationCode(code);
    existingUser.verificationCodeExpires = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
    existingUser.verificationAttempts = 0;

    await existingUser.save();
    await sendVerificationEmail(email, code);
    res.status(200).json({
      success: true,
      message: 'Account created. Check your email for a verification code.'
    });
    return;
  };
  const user = new UserModel({
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    gender
  });
  const code = generateVerificationCode();
  user.verificationCodeHash = await hashVerificationCode(code);
  user.verificationCodeExpires = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000 );
  await user.save();

  try {
    await sendVerificationEmail(user.email, code);
  } catch (err) {
    console.error('Failed to send verification email', err);
  }

  res.status(201).json({
    success: true,
    message: 'Account created. Check your email for a verification code.'
  });
});

interface VerifyEmailBody {
  email: string;
  code: string
}

export const verifyEmail = asyncHandler(async(req: Request<unknown, unknown, VerifyEmailBody>, res: Response, next: NextFunction): Promise<void> => {
  const { email, code } = req.body;
  if(!email || !code) {
    return next(new AppError('Please input 6-digit code to verify.', 400));
  }
  const user = await UserModel.findOne({email: email}).select(
    '+verificationCodeHash +verificationCodeExpires +verificationAttempts'
  );

  if(!user) {
    return next(new AppError('Invalid or expired code', 400));
  }

  if(user.isVerified) {
    res.status(200).json({
      success: true,
      message: 'Eamil already verified.'
    });
    return;
  }

  if(!user.verificationCodeHash || !user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
    return next(new AppError('Invalid or expired code', 400));
  }

  if(user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    return next(new AppError('Too many attempts. Please request a new code.', 409));
  }

  const isMatch = await compareVerificationCode(code, user.verificationCodeHash);
  if (!isMatch) {
    user.verificationAttempts += 1;
    await user.save({validateBeforeSave: false});
    return next(new AppError('Invalid or expried code', 400));
  }

  user.isVerified = true;
  user.verificationCodeHash = null;
  user.verificationCodeExpires = null;
  user.verificationAttempts = 0;
  await user.save({validateBeforeSave: false});

  res.status(200).json({
    success: true,
    message: 'Email verified successfully.'
  });
});

export const promoteToAdmin = asyncHandler( async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const user = await UserModel.findByIdAndUpdate(
    id,
    {role: 'admin'},
    { new: true, runValidators: true}
  );

  if(!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

export const getSingleUser = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await UserModel.findById(req.params.id).select(
    '-password -refreshToken -isDeleted -deletedAt -deletedBy -updatedBy'
  );

  if(!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

export const getAllUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find({ isDeleted: false })
      .select('-password -refreshToken -isDeleted -deletedAt -deletedBy -updatedBy')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    UserModel.countDocuments({ isDeleted: false }),
  ]);

  res.status(200).json({
    success: true,
    result: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { users },
  });
});

export const updateUser = asyncHandler(async (req: Request<{ id: string }, unknown, UpdateUserBody>, res: Response, next: NextFunction): Promise<void> => {
  const user = req.resource as IUser;

  if(Object.keys(req.body).length === 0) {
    return next(new AppError('Please provide at least one field to update', 400));
  }
  const { firstName, lastName, phoneNumber, email, gender } = req.body;
  user.firstName = firstName ?? user.firstName;
  user.lastName = lastName ?? user.lastName;
  user.phoneNumber = phoneNumber ?? user.phoneNumber;
  user.email = email ?? user.email;
  user.gender = gender ?? user.gender;

  await user.save({ validateBeforeSave: true });

  const userObject = user.toObject() as IUser; 
  const {
    refreshToken: _refreshToken,
    isDeleted: _isDeleted,
    deletedAt: _deletedAt,
    deletedBy: _deletedBy,
    updatedBy: _updatedBy,
    ...safeUser
  } = userObject;

  res.status(200).json({
    success: true,
    data: {user: safeUser}
  });
});
export const updateMe = asyncHandler(async (req: Request<{ id: string }, unknown, UpdateUserBody>, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (Object.keys(req.body).length === 0) {
    return next(new AppError('Please provide at least one field to update', 400));
  }

  const { firstName, lastName, phoneNumber, gender } = req.body;
  user.firstName = firstName ?? user.firstName;
  user.lastName = lastName ?? user.lastName;
  user.phoneNumber = phoneNumber ?? user.phoneNumber;
  user.gender = gender ?? user.gender;

  await user.save({ validateBeforeSave: true });

  const userObject = user.toObject() as IUser;
  const {
    refreshToken: _refreshToken,
    isDeleted: _isDeleted,
    deletedAt: _deletedAt,
    deletedBy: _deletedBy,
    updatedBy: _updatedBy,
    ...safeUser
  } = userObject;

  res.status(200).json({
    success: true,
    message: 'Update profile successfully.',
    data: { user: safeUser }
  });
});

export const deleteUser = asyncHandler(async(req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const user = req.resource as IUser;
  await user.softDelete(req.user!._id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

export const getMe = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await UserModel.findById(req.user?._id).select(
    '-password -refreshToken -isDeleted -deletedAt -deletedBy -updatedBy'
  );
  if(!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: { user }
  });
});