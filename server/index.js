const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const { extractPdf } = require('./controllers/pdfController');
const quizRoutes = require('./routes/quizRoutes');

dotenv.config();
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
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.post('/api/extract-pdf', upload.single('pdf'), (req, res, next) => {
  try {
    extractPdf(req, res);
  } catch (error) {
    next(error);
  }
});

app.use('/api/quiz', quizRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
  }
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;