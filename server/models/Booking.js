const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.ObjectId, ref: 'Service', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: false },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      additionalInfo: String,
    },
    scheduledDateTime: { type: Date, required: [true, 'Please provide scheduled date and time'] },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Pending',
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    paymentId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    meetingLink: String,
    notes: { customer: String, admin: String },
    requirements: [String],
    deliverables: [{ type: String, url: String, uploadedAt: Date }],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      submittedAt: Date,
    },
    remindersSent: { type: Number, default: 0 },
    cancelledAt: Date,
    cancelReason: String,
    rescheduledFrom: Date,
  },
  { timestamps: true }
);

bookingSchema.index({ scheduledDateTime: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
