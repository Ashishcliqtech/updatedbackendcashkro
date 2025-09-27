// src/utils/email.js

const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  try {
    // The HTML content for the email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* Basic styling for email clients */
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            text-align: center;
            margin-bottom: 20px;
          }
          .content {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #000;
            background-color: #f0f0f0;
            text-align: center;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            letter-spacing: 4px;
          }
          .footer {
            font-size: 12px;
            color: #999;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            Your One-Time Password
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Please use the following verification code to complete your action. This code is valid for 5 minutes.</p>
            <div class="otp-code">${otp}</div>
            <p>If you did not request this code, please ignore this email or contact our support.</p>
            <p>Thanks,<br/>The SaveMoney Team</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} SaveMoney. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Your OTP for SaveMoney',
      html: emailHtml, // Use the new HTML template
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