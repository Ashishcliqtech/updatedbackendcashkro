const { Resend } = require('resend');
const logger = require('./logger');
require('dotenv').config();

const resendApiKey = process.env.RESEND_API_KEY;
logger.info(`Resend API Key loaded: ${resendApiKey ? 'Yes' : 'No'}. Key starts with: ${resendApiKey ? resendApiKey.substring(0, 5) : 'N/A'}`);

const resend = new Resend(resendApiKey);

const sendOtpEmail = async (to, otp) => {
  const from = `\"${process.env.SENDER_NAME}\" <${process.env.SENDER_EMAIL}>`;
  logger.info(`Attempting to send OTP email to: ${to} from: ${from}`);

  try {
    const { data, error } = await resend.emails.send({
      from: from,
      to: to,
      subject: 'Your Verification OTP',
      html: `<p>Your One-Time Password (OTP) is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    });

    if (error) {
      logger.error('Error sending OTP email:', { error: error.message, stack: error.stack });
      throw new Error('Could not send OTP email');
    }

    logger.info('OTP email sent successfully:', { data });

  } catch (error) {
    logger.error('Caught exception in sendOtpEmail:', { error: error.message, stack: error.stack });
    throw new Error('Could not send OTP email');
  }
};

const sendPasswordResetEmail = async (to, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const from = `\"${process.env.SENDER_NAME}\" <${process.env.SENDER_EMAIL}>`;
    logger.info(`Attempting to send password reset email to: ${to} from: ${from}`);

  try {
    const { data, error } = await resend.emails.send({
      from: from,
      to: to,
      subject: 'Reset Your Password',
      html: `<p>You requested a password reset. Click this link to reset your password: <a href=\"${resetLink}\">${resetLink}</a>. This link is valid for 15 minutes.</p>`,
    });

    if (error) {
        logger.error('Error sending password reset email:', { error: error.message, stack: error.stack });
        throw new Error('Could not send password reset email');
    }

    logger.info('Password reset email sent successfully:', { data });

  } catch (error) {
    logger.error('Caught exception in sendPasswordResetEmail:', { error: error.message, stack: error.stack });
    throw new Error('Could not send password reset email');
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };
