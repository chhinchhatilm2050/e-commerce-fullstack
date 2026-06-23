import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { Resend } from 'resend';
import { CODE_EXPIRY_MINUTES } from './verificationCode.js';

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
    console.error('Resend error:', error);
    throw new Error('Failed to send verification email');
  }
};