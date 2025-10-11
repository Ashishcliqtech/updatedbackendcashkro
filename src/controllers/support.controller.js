const SupportTicket = require('../models/supportTicket.model');
const TicketMessage = require('../models/ticketMessage.model');
const { sendEmail } = require('../utils/email');

// User-facing controllers
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const newTicket = new SupportTicket({ user: userId, subject });
    await newTicket.save();

    const newMessage = new TicketMessage({ ticket: newTicket._id, user: userId, message });
    await newMessage.save();

    // Send email to admin
    const adminEmail = process.env.SENDER_EMAIL || 'YOUR_ADMIN_EMAIL@example.com';
    const emailSubject = `New Support Ticket: ${subject}`;
    const emailBody = `A new support ticket has been created by user ${userId}:\n\n${message}`;
    await sendEmail(adminEmail, emailSubject, emailBody);

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await SupportTicket.find({ user: userId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    const ticket = await SupportTicket.findOne({ _id: ticketId, user: userId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const messages = await TicketMessage.find({ ticket: ticketId });
    res.status(200).json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ticket = await SupportTicket.findOne({ _id: ticketId, user: userId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const newMessage = new TicketMessage({ ticket: ticketId, user: userId, message });
    await newMessage.save();

    ticket.updated_at = Date.now();
    await ticket.save();

    // Send email to admin
    const adminEmail = process.env.SENDER_EMAIL || 'YOUR_ADMIN_EMAIL@example.com';
    const emailSubject = `New message in ticket: ${ticket.subject}`;
    const emailBody = `User ${userId} added a new message to ticket ${ticketId}:\n\n${message}`;
    await sendEmail(adminEmail, emailSubject, emailBody);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
