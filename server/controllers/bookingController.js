const Booking = require('../models/Booking');
const Service = require('../models/Service');
const razorpay = require('../config/razorpay');
const { createTransporter } = require('../config/email');

// @desc    Get available time slots
// @route   GET /api/bookings/availability/:serviceId
// @access  Public
const getAvailability = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if service is available on this day
    if (!service.availability.days.includes(dayName)) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      service: serviceId,
      scheduledDateTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Confirmed', 'Pending'] }
    });

    // Generate available slots
    const availableSlots = [];
    const timeSlots = service.availability.timeSlots[0]; // Assuming single time slot for simplicity

    if (timeSlots) {
      const [startHour, startMinute] = timeSlots.start.split(':').map(Number);
      const [endHour, endMinute] = timeSlots.end.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, 0, 0, 0);

        // Check if this slot is already booked
        const isBooked = existingBookings.some(booking => {
          const bookingTime = new Date(booking.scheduledDateTime);
          return bookingTime.getHours() === hour;
        });

        if (!isBooked && slotTime > new Date()) {
          availableSlots.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            datetime: slotTime.toISOString()
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch availability'
    });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      customerInfo,
      scheduledDateTime,
      requirements
    } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      service: serviceId,
      scheduledDateTime: new Date(scheduledDateTime),
      status: { $in: ['Confirmed', 'Pending'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available'
      });
    }

    // Create Razorpay order
    const amount = service.price * 100; // Convert to paise
    const order = await razorpay.orders.create({
      amount,
      currency: service.currency,
      receipt: `booking_${serviceId}_${Date.now()}`,
      notes: {
        serviceId,
        serviceTitle: service.title,
        customerEmail: customerInfo.email,
        scheduledDateTime
      }
    });

    // Create booking
    const booking = await Booking.create({
      service: serviceId,
      user: req.user?.id || null,
      customerInfo,
      scheduledDateTime: new Date(scheduledDateTime),
      duration: service.duration,
      amount: service.price,
      currency: service.currency,
      requirements: requirements || [],
      paymentId: order.id
    });

    res.status(201).json({
      success: true,
      data: {
        booking,
        razorpayOrder: {
          id: order.id,
          amount: order.amount,
          currency: order.currency
        }
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to create booking'
    });
  }
};

// @desc    Confirm booking payment
// @route   POST /api/bookings/confirm-payment
// @access  Public
const confirmPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'Confirmed',
        paymentStatus: 'Paid',
        paymentId: razorpay_payment_id
      },
      { new: true }
    ).populate('service');

    // Generate meeting link (you can integrate with Zoom/Google Meet API)
    const meetingLink = `https://meet.google.com/new`; // Placeholder
    booking.meetingLink = meetingLink;
    await booking.save();

    // Update service booking count
    booking.service.totalBookings += 1;
    await booking.service.save({ validateBeforeSave: false });

    // Send confirmation emails
    await sendBookingConfirmationEmail(booking);

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to confirm payment'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { user: req.user.id },
        { 'customerInfo.email': req.user.email }
      ]
    })
    .populate('service', 'title description duration')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch bookings'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user?.toString() !== req.user.id && 
        booking.customerInfo.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled (at least 24 hours before)
    const hoursDifference = (new Date(booking.scheduledDateTime) - new Date()) / (1000 * 60 * 60);
    if (hoursDifference < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 24 hours in advance'
      });
    }

    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = cancelReason;
    await booking.save();

    // TODO: Process refund if applicable
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to cancel booking'
    });
  }
};

// Helper function to send booking confirmation email
const sendBookingConfirmationEmail = async (booking) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.customerInfo.email,
      subject: `Booking Confirmed - ${booking.service.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Booking Confirmed!</h2>
          <p>Hi ${booking.customerInfo.name},</p>
          <p>Your booking for <strong>${booking.service.title}</strong> has been confirmed.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Service:</strong> ${booking.service.title}</p>
            <p><strong>Date & Time:</strong> ${new Date(booking.scheduledDateTime).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${booking.duration} minutes</p>
            <p><strong>Amount Paid:</strong> ${booking.currency} ${booking.amount}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${booking.meetingLink}" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Meeting
            </a>
          </div>

          <p><strong>Important:</strong></p>
          <ul>
            <li>Please join the meeting 5 minutes before the scheduled time</li>
            <li>Have all required materials ready as discussed</li>
            <li>You'll receive a reminder 24 hours before the session</li>
          </ul>

          <p>If you need to reschedule or have any questions, please contact us at least 24 hours in advance.</p>
          
          <p>Best regards,<br>Your Portfolio Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send booking email error:', error);
  }
};

module.exports = {
  getAvailability,
  createBooking,
  confirmPayment,
  getUserBookings,
  cancelBooking
};