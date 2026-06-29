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

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

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
