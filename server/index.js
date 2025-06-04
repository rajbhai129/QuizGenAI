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
    ? ['https://quiz-gen-ai-raj.vercel.app/']
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.post('/api/quiz/generate', generateQuiz);
app.post('/api/extract-pdf', extractPdf);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    details: `The requested route '${req.originalUrl}' does not exist`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For Vercel serverless functions
module.exports = app;