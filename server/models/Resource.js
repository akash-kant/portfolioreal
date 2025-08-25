const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 500
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Resume Templates', 'Interview Prep', 'Coding Sheets', 'Study Notes', 'Cheat Sheets', 'Guides', 'Other']
  },
  type: {
    type: String,
    enum: ['PDF', 'Template', 'Video', 'Course', 'Other'],
    default: 'PDF'
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD']
  },
  file: {
    url: {
      type: String,
      required: [true, 'Please provide file URL']
    },
    size: Number,
    format: String
  },
  preview: {
    images: [String],
    description: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  downloads: {
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
resourceSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }

  const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  this.averageRating = Math.round((total / this.ratings.length) * 10) / 10;
  this.totalRatings = this.ratings.length;
};

module.exports = mongoose.model('Resource', resourceSchema);
