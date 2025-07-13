# QuizGenAI - AI-Powered Quiz Generator

A modern web application that generates quizzes from PDFs, images, or text using AI. Create, share, and analyze quizzes with a beautiful interface.

## Features

- **AI Quiz Generation**: Upload PDFs, images, or paste text to generate quizzes instantly
- **Manual Quiz Creation**: Create custom quizzes with your own questions and answers
- **Multilingual Support**: Extract text from both Hindi and English content
- **Quiz Sharing**: Share quizzes with anyone via unique links
- **Analytics**: Track performance and view detailed results
- **User Authentication**: Secure login and registration system
- **Admin Panel**: Manage users and quizzes (admin only)

## Multilingual Text Extraction

The application now supports both Hindi and English text extraction:

### Image OCR (Optical Character Recognition)
- **Hindi + English**: Automatically detects and extracts both languages
- **Language Selection**: Choose specific language for better accuracy
- **Smart Detection**: Automatically detects the language of extracted text
- **Performance**: Preloads language models for faster processing

### PDF Text Extraction
- **Enhanced Parsing**: Better support for multilingual PDF content
- **Language Detection**: Automatically identifies Hindi and English text
- **Text Cleaning**: Improved text processing for better accuracy

### Tips for Better Text Extraction
- Use high-resolution, well-lit images with clear text
- Ensure PDF text is selectable (not scanned images)
- Choose "Hindi + English" for mixed content
- Larger, clear fonts work better for OCR

## Tech Stack

- **Frontend**: React, Tailwind CSS, Tesseract.js
- **Backend**: Node.js, Express, MongoDB
- **AI**: OpenAI/Together AI for quiz generation
- **OCR**: Tesseract.js for image text extraction
- **PDF Processing**: pdf-parse for PDF text extraction

## Getting Started

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Start the development servers

## Environment Variables

Create `.env` files in both `quiz-app/` and `server/` directories:

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

## Usage

1. **Register/Login**: Create an account or use guest mode
2. **Create Quiz**: Choose between AI generation or manual creation
3. **Upload Content**: Upload PDFs, images, or paste text
4. **Generate**: Let AI create questions or build manually
5. **Share**: Get a unique link to share your quiz
6. **Take Quiz**: Answer questions and see results
7. **Analyze**: View detailed analytics and performance

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/quiz/generate` - Generate AI quiz
- `POST /api/quiz/create` - Create shared quiz
- `GET /api/quiz/:id` - Get shared quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `POST /api/extract-pdf` - Extract text from PDF
- `GET /api/admin/*` - Admin endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.