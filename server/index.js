const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const { extractPdf } = require('./controllers/pdfController');
const quizRoutes = require('./routes/quizRoutes');

dotenv.config();
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// PDF extraction route
app.post('/api/extract-pdf', upload.single('pdf'), extractPdf);

// Quiz routes
app.use('/api/quiz', quizRoutes); // pehle: '/api', bad me: '/api/quiz'

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});