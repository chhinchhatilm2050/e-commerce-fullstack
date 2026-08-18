import UserModel from '../model/user.js';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/appError.js';
import { Request, Response, NextFunction } from 'express';
import { 
  compareVerificationCode, MAX_VERIFICATION_ATTEMPTS, 
  MAX_RESET_ATTEMPTS, CODE_EXPIRY_MINUTES, RESET_CODE_EXPIRY_MINUTES, 
  generateVerificationCode, hashVerificationCode 
} from '../utils/verificationCode.js';
import type { LoginBody, VerifyEmailBody, CreateUserBody } from '../interface/iauth.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email.js';

const generateToken = (
  userId: string,
  payloads: Record<string, unknown>,
  secret: Secret,
  expier: SignOptions['expiresIn'],
): string => {
  return jwt.sign({ sub: userId, ...payloads }, secret, {
    issuer: 'ChhatStoreServer',
    expiresIn: expier,
  });
};

const generateRefreshToken = (
  userId: string,
  secret: Secret,
  expire: SignOptions['expiresIn'],
): string => {
  return jwt.sign({ sub: userId }, secret, {
    issuer: 'ChhatStoreServer',
    expiresIn: expire,
  });
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export const register = asyncHandler(
  async (
    req: Request<unknown, unknown, CreateUserBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { firstName, lastName, phoneNumber, email, password, gender } =
      req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return next(new AppError('This email already in use', 409));
      }
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.phoneNumber = phoneNumber;
      existingUser.password = password;
      existingUser.gender = gender;

      const code = generateVerificationCode();
      existingUser.verificationCodeHash = await hashVerificationCode(code);
      existingUser.verificationCodeExpires = new Date(
        Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000,
      );
      existingUser.verificationAttempts = 0;

      await existingUser.save();
      await sendVerificationEmail(email, code);
      res.status(200).json({
        success: true,
        message: 'Account created. Check your email for a verification code.',
      });
      return;
    }
    const user = new UserModel({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      gender,
    });
    const code = generateVerificationCode();
    user.verificationCodeHash = await hashVerificationCode(code);
    user.verificationCodeExpires = new Date(
      Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000,
    );
    await user.save();

    try {
      console.log(user.email, code);
      await sendVerificationEmail(user.email, code);
    } catch (err) {
      console.error('DEBUG: Exact Email Error ->', err);
      user.verificationCodeHash = null;
      user.verificationCodeExpires = null;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Failed to send verification email. Please try again.', 500));
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email for a verification code.',
    });
  },
);

export const login = asyncHandler(
  async (req: Request<unknown, unknown, LoginBody>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select(
      '+password email role isVerified status',
    );
    if (!user || !(await user.isMatch(password))) {
      return next(new AppError('User or password incorrect', 400));
    }
    if (!user.isVerified) {
      return next(new AppError('Please verify your email before login.', 403));
    }
    console.log((user.status as string) === 'blocked');
    if ((user.status as string) === 'blocked') {
      return next(new AppError('Your account has been blocked', 403));
    }
    
    const accessToken = generateToken(
      user._id.toString(),
      { role: user.role, email: user.email },
      process.env.JWT_SECRET as Secret,
      process.env.JWT_EXPIRE_IN as SignOptions['expiresIn'],
    );
    
    const refreshToken = generateRefreshToken(
      user._id.toString(),
      process.env.JWT_REFRESH_SECRET as Secret,
      process.env.JWT_REFRESH_EXPIRE_IN as SignOptions['expiresIn'],
    );
    
    user.refreshToken = refreshToken;
    user.status = 'active';
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _password, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      accessToken,
      user: userWithoutPassword,
      message: 'Login success fully'
    });
  },
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = (req.cookies as { refreshToken?: string } | undefined)?.refreshToken;
    if (!refreshToken) {
      return next(new AppError('No refresh token', 400));
    }

    const user = await UserModel.findOne({ refreshToken }).select(
      'refreshToken status',
    );
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    user.refreshToken = null;
    user.status = 'inactive';
    await user.save();

    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Logout successfully',
    });
  },
);

export const refresh = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = (req.cookies as {refreshToken?: string} | undefined)?.refreshToken;

    if (!refreshToken) {
      return next(new AppError('No refresh token', 400));
    }

    const decode = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as Secret,
    );
    const user = await UserModel.findById(decode.sub).select(
      'refreshToken email role',
    );

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const accessToken = generateToken(
      user._id.toString(),
      {
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET as Secret,
      process.env.JWT_EXPIRE_IN as SignOptions['expiresIn'],
    );

    const newRefreshToken = generateRefreshToken(
      user._id.toString(),
      process.env.JWT_REFRESH_SECRET as Secret,
      process.env.JWT_REFRESH_EXPIRE_IN as SignOptions['expiresIn'],
    );

    res.cookie('refreshToken', newRefreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    user.refreshToken = newRefreshToken;
    user.status = 'active';
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
    });
  },
);

export const googleCallBack = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const user = req.user;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!user) {
    return res.redirect(`${frontendUrl}?error=Authentication failed`);
  }

  if ((user.status as string) === 'blocked') {
    return res.redirect(`${frontendUrl}?error=Your account has been blocked`);

  };

  const accessToken = generateToken(
    user._id.toString(),
    {
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as Secret,
    process.env.JWT_EXPIRE_IN as SignOptions['expiresIn'],
  );

  const refreshToken = generateRefreshToken(
    user._id.toString(),
    process.env.JWT_REFRESH_SECRET as Secret,
    process.env.JWT_REFRESH_EXPIRE_IN as SignOptions['expiresIn'],
  );

  user.refreshToken = refreshToken;
  user.status = 'active';
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${frontendUrl}?token=${accessToken}`);
});

export const githubCallBack = asyncHandler(async(req: Request, res: Response, _next: NextFunction) => {
  const user = req.user;
  const frontendUrl = process.env.FRONTEND_URL;
  if (!user) {
    return res.redirect(`${frontendUrl}?error=Authentication failed`);
  }
  if ((user?.status as string) === 'blocked') {
    return res.redirect(`${frontendUrl}?error=Your account has been blocked`);
  }
  const accessToken = generateToken(
    user._id.toString(),
    {
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET as Secret,
    process.env.JWT_EXPIRE_IN as SignOptions['expiresIn'],
  );

  const refreshToken = generateRefreshToken(
    user._id.toString(),
    process.env.JWT_REFRESH_SECRET as Secret,
    process.env.JWT_REFRESH_EXPIRE_IN as SignOptions['expiresIn'],
  );

  user.refreshToken = refreshToken;
  user.status = 'active';
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${frontendUrl}?token=${accessToken}`);
});

export const facebookCallBack = asyncHandler(async(req: Request, res: Response, _next: NextFunction) => {
  const user = req.user;
  const frontendUrl = process.env.FRONTEND_URL;
  if(!user) {
    return res.redirect(`${frontendUrl}?error=Authentication failed`);
    
  }

  if((user?.status as string) === 'blocked') {
    return res.redirect(`${frontendUrl}?error=Your account has been blocked`);
  }
  const accessToken = generateToken(
    user._id.toString(),
    {
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET as Secret,
    process.env.JWT_EXPIRE_IN as SignOptions['expiresIn'],
  );

  const refreshToken = generateRefreshToken(
    user._id.toString(),
    process.env.JWT_REFRESH_SECRET as Secret,
    process.env.JWT_REFRESH_EXPIRE_IN as SignOptions['expiresIn'],
  );

  user.refreshToken = refreshToken;
  user.status = 'active';
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.redirect(`${frontendUrl}?token=${accessToken}`);
});

export const getMe = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
  const user = await UserModel.findById(req.user?._id).select(
    'role email'
  );
  if(!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

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
      message: 'Email already verified.'
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
    return next(new AppError('Invalid or expired code', 400));
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

export const forgetPassword = asyncHandler(async(req: Request<unknown, unknown, { email: string }>, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new AppError('No account found with this email.', 404));
  }

  if(!user.isVerified) {
    return next(new AppError('Your email is not verified yet.', 403));
  }

  const code = generateVerificationCode();
  const codeHash = await hashVerificationCode(code);

  user.passwordResetCode = codeHash;
  user.passwordResetExpires = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);
  user.passwordResetAttempts = 0;

  await user.save({validateBeforeSave: false});

  try {
    await sendResetPasswordEmail(user.email, code);
  } catch {
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send reset email. Please try again.', 500));
  }
  res.status(200).json({
    success: true,
    message: 'Reset code has been sent'
  });
});

export const verifyResetcode = asyncHandler(async(req: Request<unknown, unknown, {email: string, code: string}>, res: Response, next: NextFunction): Promise<void> => {
  const { email, code } = req.body;
  const user = await UserModel.findOne({email}).select('+passwordResetCode +passwordResetExpires +passwordResetAttempts');

  const invalidcode = () => next(new AppError('Invalid or expired code.', 400));
  if (!user) return invalidcode();
  if(!user.passwordResetCode || !user.passwordResetExpires) return invalidcode();
  if(new Date() > user.passwordResetExpires) return invalidcode();
  if (user.passwordResetAttempts >= MAX_RESET_ATTEMPTS) {
    return next(new AppError('Too many attempts. Please request a new code.', 429));
  }

  const isMatch = await compareVerificationCode(code, user.passwordResetCode);
  if (!isMatch) {
    user.passwordResetAttempts += 1;
    await user.save({validateBeforeSave: false});
    return invalidcode();
  }

  const resetToken = generateToken(
    user._id.toString(),
    { email: user.email },
    process.env.JWT_SECRET as Secret,
    process.env.JWT_EXPIRE_IN as SignOptions['expiresIn'],
  );

  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.passwordResetCode = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000);
  user.passwordResetAttempts = 0;
  await user.save({validateBeforeSave: false});

  res.status(200).json({
    success: true,
    message: 'Code verified successfully. You can now reset your password.',
    resetToken,
  });
});

export const resetPassword = asyncHandler(async(req: Request<unknown, unknown, { email: string, resetToken: string, password: string}>, res: Response, next: NextFunction): Promise<void> => {
  const { email, resetToken, password } = req.body;

  const hashedToken = await bcrypt.hash(resetToken, 10);
  const user = await UserModel.findOne({
    email,
    passwordResetExpires: { $gt: new Date()},
  }).select('+passwordResetCode +passwordResetExpires');

  if(!user || !user.passwordResetCode) {
    return next(new AppError('Expired session. Invalid or expired reset token. Please start over.', 400));
  }

  const isValid = await bcrypt.compare(hashedToken, user.passwordResetCode);
  if (!isValid) {
    return next(new AppError('Expired session. Invalid or expired reset token. Please start over.', 400));
  }

  user.password = password;
  user.passwordResetCode = null;
  user.passwordResetAttempts = 0;
  user.refreshToken = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login.'
  });
});

