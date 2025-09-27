
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  try {
    // Create the plain text content for the email
    const textContent = `
Hello,

Your verification code is: ${otp}

This code will expire in 5 minutes.

If you did not request this, please ignore this email.

Thanks,
The SaveMoney Team
    `;

    await resend.emails.send({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Your OTP for SaveMoney',
      text: textContent, // Use 'text' for plain text emails
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

const sendPasswordResetEmail = async (to, token) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    // Create the plain text content for the email
    const textContent = `
Hello,

You requested a password reset. Click the link below to create a new password:
${resetLink}

This link will expire in 15 minutes.

If you did not request this, please ignore this email.

Thanks,
The SaveMoney Team
    `;

    await resend.emails.send({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: 'Password Reset for SaveMoney',
      text: textContent, // Use 'text' for plain text emails
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email');
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };