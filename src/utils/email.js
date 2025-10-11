const axios = require("axios");
const logger = require("./logger");
require("dotenv").config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const API_KEY = process.env.BREVO_API_KEY; // <-- create API key in Brevo dashboard

// Generic function for sending emails via Brevo HTTP API
async function sendEmail({ to, subject, htmlContent }) {
  try {
    const payload = {
      sender: { name: process.env.SENDER_NAME, email: process.env.SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent,
    };

    const res = await axios.post(BREVO_API_URL, payload, {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    logger.info("Email sent successfully", { messageId: res.data.messageId || "via API" });
    return res.data;
  } catch (error) {
    logger.error("Error sending email via Brevo API:", {
      error: error.response?.data || error.message,
    });
    throw new Error("Could not send email");
  }
}

// Send OTP email
async function sendOtpEmail(to, otp) {
  const emailHtml = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #555; text-align: center;">Your One-Time Password</h2>
      <p style="text-align: center;">Use the following OTP to complete your verification (valid for 5 minutes):</p>
      <p style="font-size: 28px; font-weight: bold; color: #fff; background-color: #007BFF; padding: 12px 20px; border-radius: 5px; display: inline-block; margin: 20px auto; text-align: center;">
        ${otp}
      </p>
      <p style="text-align: center;">If you did not request this code, please ignore this email.</p>
    </div>
  </div>`;

  return sendEmail({ to, subject: "Your Verification OTP", htmlContent: emailHtml });
}

// Send password reset email
async function sendPasswordResetEmail(to, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const emailHtml = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #555; text-align: center;">Password Reset Request</h2>
      <p style="text-align: center;">Click the button below to set a new password (valid for 15 minutes):</p>
      <div style="text-align:center;">
        <a href="${resetLink}" style="display:inline-block; padding:12px 24px; margin:20px 0; font-size:16px; color:#fff; background-color:#007BFF; text-decoration:none; border-radius:5px;">
          Reset Your Password
        </a>
      </div>
      <p style="font-size: 12px; color: #777; text-align:center;">
        If the button above doesn't work, copy and paste this link:<br>
        <a href="${resetLink}" style="color:#007BFF;">${resetLink}</a>
      </p>
    </div>
  </div>`;

  return sendEmail({ to, subject: "Reset Your Password", htmlContent: emailHtml });
}

async function sendSupportEmail(to, subject, textContent) {
    const htmlContent = `<p>${textContent.replace(/\n/g, '<br>')}</p>`;
    return sendEmail({ to, subject, htmlContent });
}

module.exports = { sendOtpEmail, sendPasswordResetEmail, sendSupportEmail };
