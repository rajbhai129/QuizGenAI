const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { generateQuiz } = require('./controllers/quizController');
const { extractPdf } = require('./controllers/pdfController');

dotenv.config();
const app = express();

// Increase payload size limits BEFORE other middleware
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://quiz-gen-ai-sooty.vercel.app', 'https://quiz-gen-ai.vercel.app']
    : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Add preflight handling for PDF upload
app.options('/api/extract-pdf', cors(corsOptions));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.post('/api/quiz/generate', generateQuiz);
app.post('/api/extract-pdf', extractPdf);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'File too large',
      details: 'Maximum file size is 50MB'
    });
  }
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

const PORT = process.env.PORT || 5000;

// Remove the app.listen call for Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;