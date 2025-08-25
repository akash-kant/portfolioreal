const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.ObjectId,
    ref: 'Resource',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  customerInfo: {
    name: String,
    email: {
      type: String,
      required: true
    }
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: 5
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  downloadLinks: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    used: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
purchaseSchema.index({ paymentId: 1 });
purchaseSchema.index({ user: 1, createdAt: -1 });
purchaseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Purchase', purchaseSchema);
