const nodemailer = require('nodemailer');
const logger = require('./logger');
require('dotenv').config();

// Log the configuration to be used by Nodemailer
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: '[REDACTED]', // Do not log the actual password for security
  },
};
logger.info('Initializing Nodemailer with the following configuration:', emailConfig);

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Brevo SMTP user
    pass: process.env.EMAIL_PASS, // Brevo SMTP key
  },
});

const sendOtpEmail = async (to, otp) => {
  const from = `\"${process.env.SENDER_NAME}\" <${process.env.SENDER_EMAIL}>`;
  logger.info(`Attempting to send OTP email to: ${to} from: ${from}`);

  // Professional HTML email template
  const emailHtml = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
        <h1 style="color: #444; margin: 0;">${process.env.SENDER_NAME}</h1>
      </div>
      <div style="text-align: center; padding: 30px 0;">
        <h2 style="color: #555;">Your One-Time Password</h2>
        <p>Please use the following OTP to complete your verification. This code is valid for 5 minutes.</p>
        <p style="font-size: 28px; font-weight: bold; color: #fff; background-color: #007BFF; letter-spacing: 2px; padding: 12px 20px; border-radius: 5px; display: inline-block; margin: 20px 0;">
          ${otp}
        </p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
      <div style="text-align: center; padding-top: 20px; font-size: 12px; color: #777; border-top: 1px solid #ddd;">
        <p>&copy; ${new Date().getFullYear()} ${process.env.SENDER_NAME}. All rights reserved.</p>
      </div>
    </div>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: 'Your Verification OTP',
      html: emailHtml,
    });

    logger.info('OTP email sent successfully', { messageId: info.messageId });
  } catch (error) {
    logger.error('Error sending OTP email:', { error: error.message, stack: error.stack });
    throw new Error('Could not send OTP email');
  }
};

const sendPasswordResetEmail = async (to, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const from = `\"${process.env.SENDER_NAME}\" <${process.env.SENDER_EMAIL}>`;
  logger.info(`Attempting to send password reset email to: ${to} from: ${from}`);

  // Professional HTML email template for password reset
  const emailHtml = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
        <h1 style="color: #444; margin: 0;">${process.env.SENDER_NAME}</h1>
      </div>
      <div style="text-align: center; padding: 30px 0;">
        <h2 style="color: #555;">Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to set a new password. This link is valid for 15 minutes.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">If the button above doesn't work, copy and paste this link into your browser:<br><a href="${resetLink}" style="color: #007BFF;">${resetLink}</a></p>
      </div>
      <div style="text-align: center; padding-top: 20px; font-size: 12px; color: #777; border-top: 1px solid #ddd;">
        <p>&copy; ${new Date().getFullYear()} ${process.env.SENDER_NAME}. All rights reserved.</p>
      </div>
    </div>
  </div>`;

  try {
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: 'Reset Your Password',
      html: emailHtml,
    });

    logger.info('Password reset email sent successfully', { messageId: info.messageId });
  } catch (error) {
    logger.error('Error sending password reset email:', { error: error.message, stack: error.stack });
    throw new Error('Could not send password reset email');
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };
