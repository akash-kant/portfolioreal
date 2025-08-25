const Contact = require('../models/Contact');
const { createTransporter } = require('../config/email');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Create contact record
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      category: category || 'General'
    });

    // Send notification email to admin
    await sendContactNotificationEmail(contact);

    // Send auto-reply to user
    await sendAutoReplyEmail(contact);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.',
      data: {
        id: contact._id,
        status: contact.status
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send message. Please try again.'
    });
  }
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contact
// @access  Private (Admin)
const getContacts = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    let query = Contact.find();
    
    if (status) {
      query = query.where('status').equals(status);
    }
    
    if (category) {
      query = query.where('category').equals(category);
    }

    const contacts = await query
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query.getQuery());

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch contacts'
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private (Admin)
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to update status'
    });
  }
};

// @desc    Reply to contact
// @route   POST /api/contact/:id/reply
// @access  Private (Admin)
const replyToContact = async (req, res) => {
  try {
    const { message } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update contact with response
    contact.response = {
      message,
      respondedAt: new Date(),
      respondedBy: req.user.id
    };
    contact.status = 'Replied';
    await contact.save();

    // Send reply email
    await sendReplyEmail(contact);

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: contact
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send reply'
    });
  }
};

// Helper function to send notification email to admin
const sendContactNotificationEmail = async (contact) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: `New Contact Form Submission - ${contact.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Category:</strong> ${contact.category}</p>
            <p><strong>Subject:</strong> ${contact.subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px;">${contact.message}</p>
            <p><strong>Submitted:</strong> ${contact.createdAt.toLocaleString()}</p>
          </div>

          <p><a href="${process.env.CLIENT_URL}/admin/contacts/${contact._id}">View in Admin Panel</a></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send notification email error:', error);
  }
};

// Helper function to send auto-reply email
const sendAutoReplyEmail = async (contact) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Thank you for contacting me - ${contact.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${contact.name},</p>
          <p>Thank you for your message. I've received your inquiry about "${contact.subject}" and I'll get back to you within 24-48 hours.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px;">${contact.message}</p>
          </div>

          <p>In the meantime, feel free to:</p>
          <ul>
            <li>Check out my <a href="${process.env.CLIENT_URL}/blog">latest blog posts</a></li>
            <li>Browse my <a href="${process.env.CLIENT_URL}/projects">recent projects</a></li>
            <li>Follow me on <a href="#">LinkedIn</a> for daily updates</li>
          </ul>

          <p>Best regards,<br>Your Name</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send auto-reply email error:', error);
  }
};

// Helper function to send reply email
const sendReplyEmail = async (contact) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Response to your inquiry</h2>
          <p>Hi ${contact.name},</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your original message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; margin-bottom: 15px;">${contact.message}</p>
            
            <p><strong>My response:</strong></p>
            <p style="background: #e3f2fd; padding: 15px; border-radius: 4px;">${contact.response.message}</p>
          </div>

          <p>Feel free to reply to this email if you have any follow-up questions.</p>

          <p>Best regards,<br>Your Name</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send reply email error:', error);
  }
};

module.exports = {
  submitContact,
  getContacts,
  updateContactStatus,
  replyToContact
};