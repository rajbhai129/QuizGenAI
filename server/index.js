const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { generateQuiz } = require('./controllers/quizController');
const { extractPdf } = require('./controllers/pdfController');

dotenv.config();
const app = express();

// Configure CORS (restrict origins in production)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://quiz-gen-ai-raj.vercel.app/'] // Replace with your frontend domain
    : '*', // Allow all origins in development
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// Configure middleware with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.post('/api/quiz/generate', generateQuiz);
app.post('/api/extract-pdf', extractPdf);

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    details: `The requested route '${req.originalUrl}' does not exist`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // Handle Payload Too Large error
  if (err.status === 413 || (err instanceof SyntaxError && err.message.includes('too large'))) {
    return res.status(413).json({
      error: 'Content too large',
      details: 'The request content exceeds the maximum allowed size of 50MB',
    });
  }

  // Handle JSON Syntax Error
  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    return res.status(400).json({
      error: 'Invalid JSON',
      details: 'The request body contains invalid JSON syntax',
    });
  }

  // Generic error handler
  res.status(err.status || 500).json({
    error: 'Internal server error',
    details: err.message || 'An unexpected error occurred',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});