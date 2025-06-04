const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { generateQuiz } = require('./controllers/quizController');
const { extractPdf } = require('./controllers/pdfController');

dotenv.config();
const app = express();

// Configure middleware with increased limits
app.use(express.json({ limit: '50mb' }));
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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes - Move extractPdf route before other routes
app.post('/api/extract-pdf', extractPdf);
app.post('/api/quiz/generate', generateQuiz);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

module.exports = app;