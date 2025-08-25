const Booking = require('../models/Booking');
const Service = require('../models/Service');
const razorpay = require('../config/razorpay');
const { createTransporter } = require('../config/email');
const crypto = require('crypto');

const getAvailability = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date' });
    }
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (!service.availability?.days?.includes(dayName)) {
      return res.status(200).json({ success: true, data: [] });
    }

    const startOfDay = new Date(selectedDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(selectedDate); endOfDay.setHours(23,59,59,999);

    const existingBookings = await Booking.find({
      service: serviceId,
      scheduledDateTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Confirmed', 'Pending'] },
    });

    const availableSlots = [];
    const timeSlots = service.availability?.timeSlots;
    if (timeSlots) {
      const [startHour] = timeSlots.start.split(':').map(Number);
      const [endHour] = timeSlots.end.split(':').map(Number);
      for (let hour = startHour; hour < endHour; hour++) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, 0, 0, 0);
        const isBooked = existingBookings.some(b => new Date(b.scheduledDateTime).getHours() === hour);
        if (!isBooked && slotTime > new Date()) {
          availableSlots.push({ time: `${hour.toString().padStart(2, '0')}:00`, datetime: slotTime.toISOString() });
        }
      }
    }

    res.status(200).json({ success: true, data: availableSlots });
  } catch (e) {
    console.error('Get availability error:', e);
    res.status(500).json({ success: false, message: 'Unable to fetch availability' });
  }
};

const createBooking = async (req, res) => {
  try {
    const { serviceId, customerInfo, scheduledDateTime, requirements } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const existingBooking = await Booking.findOne({
      service: serviceId,
      scheduledDateTime: new Date(scheduledDateTime),
      status: { $in: ['Confirmed', 'Pending'] },
    });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'This time slot is no longer available' });
    }

    const amount = Math.round(Number(service.price) * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: service.currency,
      receipt: `booking_${serviceId}_${Date.now()}`,
      notes: { serviceId, serviceTitle: service.title, customerEmail: customerInfo.email, scheduledDateTime },
    });

    const booking = await Booking.create({
      service: serviceId,
      user: req.user?.id || null,
      customerInfo,
      scheduledDateTime: new Date(scheduledDateTime),
      duration: service.duration,
      amount: service.price,
      currency: service.currency,
      requirements: requirements || [],
      paymentId: order.id,
    });

    res.status(201).json({
      success: true,
      data: {
        booking,
        razorpayOrder: { id: order.id, amount: order.amount, currency: order.currency },
      },
    });
  } catch (e) {
    console.error('Create booking error:', e);
    res.status(500).json({ success: false, message: 'Unable to create booking' });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'Confirmed', paymentStatus: 'Paid', paymentId: razorpay_payment_id },
      { new: true }
    ).populate('service');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.meetingLink = 'https://meet.google.com/new';
    await booking.save();

    booking.service.totalBookings += 1;
    await booking.service.save({ validateBeforeSave: false });

    await sendBookingConfirmationEmail(booking);

    res.status(200).json({ success: true, message: 'Booking confirmed successfully', data: booking });
  } catch (e) {
    console.error('Confirm payment error:', e);
    res.status(500).json({ success: false, message: 'Unable to confirm payment' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ user: req.user.id }, { 'customerInfo.email': req.user.email }],
    })
      .populate('service', 'title description duration')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: bookings });
  } catch (e) {
    console.error('Get bookings error:', e);
    res.status(500).json({ success: false, message: 'Unable to fetch bookings' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user?.toString() !== req.user.id && booking.customerInfo.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    const hoursDifference = (new Date(booking.scheduledDateTime) - new Date()) / (1000 * 60 * 60);
    if (hoursDifference < 24) {
      return res.status(400).json({ success: false, message: 'Cannot cancel booking less than 24 hours in advance' });
    }

    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = cancelReason;
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (e) {
    console.error('Cancel booking error:', e);
    res.status(500).json({ success: false, message: 'Unable to cancel booking' });
  }
};

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
            <a href="${booking.meetingLink}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Meeting
            </a>
          </div>
          <p>Best regards,<br/>Portfolio Team</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error('Send booking email error:', e);
  }
};

module.exports = { getAvailability, createBooking, confirmPayment, getUserBookings, cancelBooking };
