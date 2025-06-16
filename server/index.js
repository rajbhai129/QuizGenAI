const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const { protect } = require('./middleware/auth');
const multer = require('multer');
const { extractPdf } = require('./controllers/pdfController');

dotenv.config();
connectDB();

const app = express();

// Configure multer for PDF uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.post('/api/extract-pdf', protect, upload.single('pdf'), (req, res, next) => {
  try {
    extractPdf(req, res);
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/quiz', protect, quizRoutes); // Already protected

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // More detailed error logging
  if (err.name === 'MongoError') {
    console.error('MongoDB Error:', err);
  }
  if (err.name === 'ValidationError') {
    console.error('Validation Error:', err);
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;