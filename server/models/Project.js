const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
  images: [{
    type: String
  }],
  technologies: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'DevOps', 'Other']
  },
  demoUrl: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please provide a valid URL']
  },
  githubUrl: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please provide a valid URL']
  },
  features: [{
    type: String
  }],
  challenges: [{
    type: String
  }],
  learnings: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Completed', 'In Progress', 'Planned'],
    default: 'Completed'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  completedDate: Date,
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
