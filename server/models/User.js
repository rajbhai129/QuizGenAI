const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  quizHistory: [{
    quizId: String,
    date: Date,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    incorrectAnswers: Number,
    type: {
      type: String,
      enum: ['taken', 'created', 'shared-taken'],
      default: 'taken'
    },
    details: [{
      question: String,
      userAnswer: String,
      correctAnswer: String,
      score: Number,
      isCorrect: Boolean
    }]
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;