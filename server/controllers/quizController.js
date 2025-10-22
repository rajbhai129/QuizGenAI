const axios = require("axios");
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { generateQuizWithHuggingFace } = require('../utils/huggingFaceApi');
const { chunkText } = require('../utils/textChunker'); // New import

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

    const textChunks = chunkText(content.trim(), 1500); // Chunk size for LLM context, adjust as needed
    let allGeneratedQuizzes = [];

    // Calculate questions per chunk
    const questionsPerChunk = Math.ceil(totalQuestions / textChunks.length);
    let singleCorrectRemaining = singleCorrect;
    let multipleCorrectRemaining = multipleCorrect;

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      let currentChunkSingle = 0;
      let currentChunkMultiple = 0;
      let currentChunkTotal = 0;

      // Distribute single and multiple correct questions
      if (singleCorrectRemaining > 0) {
        currentChunkSingle = Math.min(questionsPerChunk, singleCorrectRemaining);
        singleCorrectRemaining -= currentChunkSingle;
      }
      if (multipleCorrectRemaining > 0) {
        currentChunkMultiple = Math.min(questionsPerChunk, multipleCorrectRemaining);
        multipleCorrectRemaining -= currentChunkMultiple;
      }
      currentChunkTotal = currentChunkSingle + currentChunkMultiple;

      if (currentChunkTotal === 0 && (singleCorrectRemaining > 0 || multipleCorrectRemaining > 0)) {
        // If we still need questions but this chunk didn't get any, assign remaining proportionally
        if (singleCorrectRemaining > 0) {
          currentChunkSingle = singleCorrectRemaining;
          singleCorrectRemaining = 0;
        }
        if (multipleCorrectRemaining > 0) {
          currentChunkMultiple = multipleCorrectRemaining;
          multipleCorrectRemaining = 0;
        }
        currentChunkTotal = currentChunkSingle + currentChunkMultiple;
      }


      if (currentChunkTotal === 0) {
        continue; // Skip if no questions are assigned to this chunk
      }
      
      const prompt = `You are a Quiz Generator AI. Create a quiz following these EXACT requirements:\r\n\r\nCONTENT TO USE:\r\n${chunk}\r\n\r\nREQUIREMENTS:\r\n1. Generate EXACTLY ${currentChunkTotal} questions total\r\n2. ${currentChunkSingle > 0 ? `First ${currentChunkSingle} questions must be SINGLE correct type\r\n` : ''}${currentChunkMultiple > 0 ? `Last ${currentChunkMultiple} questions must be MULTIPLE correct type\r\n` : ''}3. Each question must have EXACTLY ${optionsPerQuestion} options\r\n4. Label options as a), b), c), etc.\r\n5. Multiple-choice questions must have 2 or more correct answers\r\n6. Respond ONLY in JSON format\r\n\r\nOutput the quiz as a JSON array of objects with the following structure:\r\n[\r\n  {\r\n    \"question\": \"Question text\",\r\n    \"type\": \"single\", // or \"multiple\"\r\n    \"options\": [\"Option 1\", \"Option 2\", \"Option 3\", ...],\r\n    \"correctAnswers\": [0] // or [0, 2] for multiple correct (indices of correct options)\r\n  },\r\n  ...\r\n]\r\n\r\nSTRICT RULES:\r\n- Generate exactly ${currentChunkTotal} questions\r\n- Include exactly ${optionsPerQuestion} options per question\r\n- Use zero-based indices for correctAnswers\r\n- No extra text outside the JSON\r\n\r\nGenerate the quiz now:`;
      
      let attempt = 0;
      let maxAttempts = 3;
      let chunkQuizArray = [];

      while (attempt < maxAttempts) {
        try {
          const generatedText = await generateQuizWithHuggingFace(prompt);
          console.log(`Raw AI Response (Hugging Face) for chunk ${i + 1}:`, generatedText);
          
          chunkQuizArray = JSON.parse(generatedText);
          
          if (validateQuizStructure(chunkQuizArray, currentChunkTotal, currentChunkSingle, currentChunkMultiple, optionsPerQuestion)) {
            allGeneratedQuizzes.push(...chunkQuizArray);
            break; // Exit retry loop for this chunk
          } else {
            throw new Error('Quiz validation failed for chunk');
          }
        } catch (error) {
          console.log(`Attempt ${attempt + 1} for chunk ${i + 1} failed:`, error.message);
          attempt++;
          if (attempt === maxAttempts) {
            throw new Error(`Failed to generate valid quiz for chunk ${i + 1} after ${maxAttempts} attempts`);
          }
        }
      }
    }

    // After all chunks, validate the combined quiz
    if (!validateQuizStructure(allGeneratedQuizzes, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion)) {
      throw new Error('Final combined quiz failed validation.');
    }

    // Save quiz to user's history
    const user = await User.findById(req.user._id);
    user.quizHistory.push({
      quizId: Date.now().toString(),
      totalQuestions: totalQuestions,
      details: allGeneratedQuizzes,
      type: 'created',
      date: new Date()
    });
    await user.save();

    res.status(200).json({ quiz: allGeneratedQuizzes });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ 
      error: "Failed to generate quiz",
      details: error.message,
      attempts: error.attempts // This might not be accurate with chunking, consider refining
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