const { Resend } = require('resend');
const logger = require('./logger');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  try {
    await resend.emails.send({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Your Verification OTP',
      html: `<p>Your One-Time Password (OTP) is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    });
  } catch (error) {
    logger.error('Error sending OTP email:', { error: error.message, stack: error.stack });
    throw new Error('Could not send OTP email');
  }
};

const sendPasswordResetEmail = async (to, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  try {
    await resend.emails.send({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Reset Your Password',
      html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetLink}">${resetLink}</a>. This link is valid for 15 minutes.</p>`,
    });
  } catch (error) {
    logger.error('Error sending password reset email:', { error: error.message, stack: error.stack });
    throw new Error('Could not send password reset email');
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };

