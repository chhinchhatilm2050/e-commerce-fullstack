import { Resend } from 'resend';
import { CODE_EXPIRY_MINUTES, RESET_CODE_EXPIRY_MINUTES } from './verificationCode.js';
import AppError from './appError.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async(email: string, code: string): Promise<void> => {
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM ?? 'onboarding@resend.dev',
    to: email,
    subject: 'Verify your email',
    text: `Your verification code is ${code}. It expires in ${CODE_EXPIRY_MINUTES} minutes.`,
    html: `<p>Your verification code is <b>${code}</b>.</p><p>It expires in ${CODE_EXPIRY_MINUTES} minutes.</p>`
  });
  if (error) {
    throw new AppError('Failed to send verification email', 401);
  }
};

export const sendResetPasswordEmail = async( email: string, code: string ): Promise<void> => {
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM ?? 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your password',
    text: `Your password reset code is ${code}. It expires in ${RESET_CODE_EXPIRY_MINUTES} minutes. If you didn't request this, ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p>Your reset code is <b>${code}</b>.</p>
      <p>It expires in <b>${RESET_CODE_EXPIRY_MINUTES} minutes</b>.</p>
      <p>If you didn't request this, safely ignore this email.</p>
    `,
  });

  if (error) {
    throw new AppError('Failed to send password reset email', 401);
  }
};