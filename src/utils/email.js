// src/utils/email.js

const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * A simple and robust HTML email template.
 * @param {string} title - The main heading for the email.
 * @param {string} body - The main paragraph content.
 * @param {string} footerText - Text for the footer.
 * @returns {string} - The complete HTML for the email.
 */
const createEmailTemplate = (title, body, footerText) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <tr>
        <td style="padding: 40px 30px 40px 30px;">
          <h1 style="font-size: 24px; color: #333333; text-align: center; margin-bottom: 20px;">${title}</h1>
          <p style="font-size: 16px; color: #555555; line-height: 1.6;">${body}</p>
          <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 30px;">${footerText}</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

const sendOtpEmail = async (to, otp) => {
  try {
    const title = 'Your One-Time Password';
    const body = `
      Hello,<br/><br/>
      Your verification code is below. This code is valid for the next 5 minutes.<br/><br/>
      <div style="font-size: 32px; font-weight: bold; color: #000; background-color: #f0f0f0; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0; letter-spacing: 4px;">
        ${otp}
      </div>
      If you did not request this code, please ignore this email.
    `;
    const footer = `© ${new Date().getFullYear()} SaveMoney. All rights reserved.`;

    const emailHtml = createEmailTemplate(title, body, footer);

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
    const title = 'Password Reset Request';
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const body = `
      Hello,<br/><br/>
      You requested a password reset. Click the button below to set a new password. This link is valid for 15 minutes.<br/><br/>
      <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Reset Your Password</a><br/><br/>
      If you did not request a password reset, you can safely ignore this email.
    `;
    const footer = `© ${new Date().getFullYear()} SaveMoney. All rights reserved.`;

    const emailHtml = createEmailTemplate(title, body, footer);

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