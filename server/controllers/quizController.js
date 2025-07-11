const axios = require("axios");
const User = require('../models/User');
const Quiz = require('../models/Quiz');

const generateQuiz = async (req, res) => {
  try {
    // Restrict guest user from creating more than 2 quizzes
    if (req.user.email === 'guest@quizgenai.com') {
      const user = await User.findById(req.user._id);
      const guestCreated = user.quizHistory.filter(q => q.type === 'created').length;
      if (guestCreated >= 2) {
        return res.status(403).json({ error: 'Guest account can only create 2 quizzes. Please register for unlimited access.' });
      }
    }
    const { content, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion } = req.body;

    // Input validation
    if (!content?.trim() || !totalQuestions || !singleCorrect || !multipleCorrect || !optionsPerQuestion) {
      return res.status(400).json({ error: "Missing or invalid input fields" });
    }

    // Construct a clearer prompt
    const prompt = `You are a Quiz Generator AI. Create a quiz following these EXACT requirements:

CONTENT TO USE:
${content.trim()}

REQUIREMENTS:
1. Generate EXACTLY ${totalQuestions} questions total
2. First ${singleCorrect} questions must be SINGLE correct type
3. Last ${multipleCorrect} questions must be MULTIPLE correct type
4. Each question must have EXACTLY ${optionsPerQuestion} options
5. Label options as a), b), c), etc.
6. Multiple-choice questions must have 2 or more correct answers
7. Respond ONLY in JSON format

Output the quiz as a JSON array of objects with the following structure:
[
  {
    "question": "Question text",
    "type": "single", // or "multiple"
    "options": ["Option 1", "Option 2", "Option 3", ...],
    "correctAnswers": [0] // or [0, 2] for multiple correct (indices of correct options)
  },
  ...
]

STRICT RULES:
- Generate exactly ${totalQuestions} questions
- Include exactly ${optionsPerQuestion} options per question
- Use zero-based indices for correctAnswers
- No extra text outside the JSON

Generate the quiz now:`;

    // Make API call with retry logic
    let attempt = 0;
    let maxAttempts = 3;
    let quizArray = [];

    while (attempt < maxAttempts && quizArray.length !== totalQuestions) {
      try {
        const response = await axios.post(
          "https://api.together.xyz/v1/chat/completions", // Changed to chat completions endpoint for JSON mode
          {
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages: [
              {
                "role": "system",
                "content": "Only respond in JSON format."
              },
              {
                "role": "user",
                "content": prompt
              }
            ],
            response_format: {
              "type": "json_object"
            },
            max_tokens: 2000,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const text = response.data.choices[0].message.content;
        console.log('Raw AI Response:', text); // Debug log
        
        // Parse JSON response directly
        quizArray = JSON.parse(text);
        
        // Validate quiz structure
        if (validateQuizStructure(quizArray, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion)) {
          // Save quiz to user's history
          const user = await User.findById(req.user._id);
          user.quizHistory.push({
            quizId: Date.now().toString(),
            totalQuestions: totalQuestions,
            details: quizArray,
            type: 'created',
            date: new Date()
          });
          await user.save();
          break;
        } else {
          throw new Error('Quiz validation failed');
        }
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed:`, error.message);
        attempt++;
        if (attempt === maxAttempts) {
          throw new Error(`Failed to generate valid quiz after ${maxAttempts} attempts`);
        }
      }
    }

    res.status(200).json({ quiz: quizArray });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ 
      error: "Failed to generate quiz",
      details: error.message,
      attempts: error.attempts
    });
  }
};

// Updated validation function for JSON structure
function validateQuizStructure(quiz, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion) {
  if (!Array.isArray(quiz) || quiz.length !== totalQuestions) {
    return false;
  }

  const singleCount = quiz.filter(q => q.type === 'single').length;
  const multipleCount = quiz.filter(q => q.type === 'multiple').length;

  if (singleCount !== parseInt(singleCorrect) || multipleCount !== parseInt(multipleCorrect)) {
    return false;
  }

  return quiz.every(q => {
    return q.options.length === optionsPerQuestion &&
           q.correctAnswers.length > 0 &&
           (q.type === 'single' ? q.correctAnswers.length === 1 : q.correctAnswers.length >= 2) &&
           q.correctAnswers.every(a => a >= 0 && a < optionsPerQuestion);
  });
}

// Create a shared quiz
const createSharedQuiz = async (req, res) => {
  try {
    // Restrict guest user from creating more than 2 quizzes
    if (req.user.email === 'guest@quizgenai.com') {
      const user = await User.findById(req.user._id);
      const guestCreated = user.quizHistory.filter(q => q.type === 'created').length;
      if (guestCreated >= 2) {
        return res.status(403).json({ error: 'Guest account can only create 2 quizzes. Please register for unlimited access.' });
      }
    }
    const { details, title, description } = req.body;
    const quizId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const quiz = await Quiz.create({
      quizId,
      creator: req.user._id,
      details,
      title,
      description
    });
    res.status(201).json({ quizId: quiz.quizId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a shared quiz by ID
const getSharedQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit a shared quiz result
const submitSharedQuiz = async (req, res) => {
  try {
    const { answers, score, correctAnswers, incorrectAnswers, details } = req.body;
    const quiz = await Quiz.findOne({ quizId: req.params.id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    // Save to taker's history
    const taker = await User.findById(req.user._id);
    taker.quizHistory.push({
      quizId: quiz.quizId,
      date: new Date(),
      score,
      totalQuestions: quiz.details.length,
      correctAnswers,
      incorrectAnswers,
      type: 'taken',
      details
    });
    await taker.save();
    // Save to creator's history (as 'shared-taken')
    const creator = await User.findById(quiz.creator);
    creator.quizHistory.push({
      quizId: quiz.quizId,
      date: new Date(),
      score,
      totalQuestions: quiz.details.length,
      correctAnswers,
      incorrectAnswers,
      type: 'shared-taken',
      details,
      takenBy: taker._id
    });
    await creator.save();
    res.json({ message: 'Quiz submitted and results saved.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateQuiz,
  createSharedQuiz,
  getSharedQuiz,
  submitSharedQuiz
};