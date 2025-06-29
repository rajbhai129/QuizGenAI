const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const { protect } = require('./middleware/auth');
const multer = require('multer');
const { extractPdf } = require('./controllers/pdfController');

// Load environment variables
dotenv.config();

//vjjfjfjcjn
// Connect to MongoDBhhh
connectDB();

const app = express();

// -------------------------
// ✅ CORS Configuration
// -------------------------
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://quiz-gen-ai-raj.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204, // For legacy browsers
  preflightContinue: false
};

app.use(cors(corsOptions));

// 🛑 Make sure this line is BEFORE all routes
app.options('*', cors(corsOptions));

// -------------------------
// Middleware
// -------------------------
app.use(express.json({ limit: '50mb' }));

// -------------------------
// PDF Upload Config (Multer)
// -------------------------
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// -------------------------
// Routes
// -------------------------
app.post('/api/extract-pdf', protect, upload.single('pdf'), (req, res, next) => {
  try {
    extractPdf(req, res);
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes); // All quiz-related routes

// -------------------------
// 404 Handler
// -------------------------
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// -------------------------
// Global Error Handler
// -------------------------
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      error: 'Database Error',
      message: process.env.NODE_ENV === 'production' ? 'Database operation failed' : err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  if (err.message && err.message.includes('Missing parameter name')) {
    return res.status(400).json({
      error: 'Route Error',
      message: 'Invalid route configuration'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
//temp change for coomit