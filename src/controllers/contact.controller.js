const ContactInquiry = require('../models/contactInquiry.model');
const { sendEmail } = require('../utils/email');

exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newInquiry = new ContactInquiry({ name, email, message });
    await newInquiry.save();

    // Send email to admin
    const adminEmail = process.env.SENDER_EMAIL || 'YOUR_ADMIN_EMAIL@example.com';
    const emailSubject = 'New Contact Inquiry';
    const emailBody = `You have a new contact inquiry from ${name} (${email}):\n\n${message}`;
    await sendEmail(adminEmail, emailSubject, emailBody);

    res.status(201).json({ message: 'Your inquiry has been submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
