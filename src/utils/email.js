// src/utils/email.js

const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Thanks,<br>The SaveMoney Team</p>
      </div>
    `;

    await resend.emails.send({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Your OTP for SaveMoney',
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

const sendPasswordResetEmail = async (to, token) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to create a new password:</p>
        <p><a href="${resetLink}" style="color: #007bff;">${resetLink}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Thanks,<br>The SaveMoney Team</p>
      </div>
    `;

    await resend.emails.send({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Password Reset for SaveMoney',
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email');
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };