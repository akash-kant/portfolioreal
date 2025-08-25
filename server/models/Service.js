const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 500
  },
  detailedDescription: {
    type: String,
    maxlength: 2000
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Resume Review', 'Mock Interview', 'Career Consultation', 'Code Review', 'Mentorship', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide duration'],
    min: 15
  },
  deliveryTime: {
    type: String,
    required: [true, 'Please provide delivery time'],
    enum: ['Same Day', '1-2 Days', '3-5 Days', '1 Week', 'Custom']
  },
  features: [{
    type: String,
    required: true
  }],
  requirements: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  maxBookingsPerDay: {
    type: Number,
    default: 5
  },
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      start: String, // e.g., "09:00"
      end: String    // e.g., "17:00"
    }]
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    min: 1,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average rating
serviceSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }

  const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  this.averageRating = Math.round((total / this.ratings.length) * 10) / 10;
  this.totalRatings = this.ratings.length;
};

module.exports = mongoose.model('Service', serviceSchema);
