const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
    unique: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  details: {
    type: Array,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema); 