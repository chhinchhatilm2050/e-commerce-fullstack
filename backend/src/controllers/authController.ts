import UserModel from '../model/user.js';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/appError.js';
import { Request, Response, NextFunction } from 'express';

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

interface LoginBody {
  email: string;
  password: string;
}

export const login = asyncHandler(
  async (req: Request<unknown, unknown, LoginBody>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select(
      '+password email role',
    );
    console.log(password);
    console.log(await user!.isMatch(password));

    if (!user || !(await user.isMatch(password))) {
      return next(new AppError('User or password incorrect', 400));
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
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _password, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      status: 'success',
      accessToken,
      user: userWithoutPassword,
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
      'refreshToken',
    );
    if (!user) {
      return next(new AppError('No user found', 404));
    }

    user.refreshToken = null;
    await user.save();

    res.clearCookie(refreshToken);

    res.status(200).json({
      status: 'success',
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

    res.status(200).json({
      status: 'success',
      accessToken,
    });
  },
);

export const googleCallBack = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return next(new AppError('Authentication failed', 401));
  }

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
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 'success',
    accessToken,
    user: user
  });
});

export const githubCallBack = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return next(new AppError('Authentication failed', 401));
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
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 'success',
    accessToken,
    data: user
  });
});

export const facebookCallBack = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if(!user) {
    return next(new AppError('Authentication failed', 401));
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
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 'success',
    accessToken,
    data: user
  });
});
