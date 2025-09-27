// src/utils/email.js

const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  try {
    await resend.emails.send({
      // IMPORTANT: This 'from' address MUST be from a domain you have verified in Resend.
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Your OTP for SaveMoney',
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

const sendPasswordResetEmail = async (to, token) => {
  try {
    await resend.emails.send({
      // IMPORTANT: This 'from' address MUST be from a domain you have verified in Resend.
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Password Reset for SaveMoney',
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">here</a> to reset your password.</p>`,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email');
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };