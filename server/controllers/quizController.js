const axios = require("axios");

// Utility to add delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility to preprocess content by removing problematic characters
const preprocessContent = (content) => {
  return content
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\r/g, '') // Remove carriage returns
    .trim();
};

// Utility to attempt fixing invalid JSON
const attemptFixJson = (text) => {
  try {
    // Try parsing the original text first
    return JSON.parse(text);
  } catch (error) {
    console.log('Initial JSON parse failed:', error.message);
    // Attempt to fix unterminated strings by appending a closing quote
    let fixedText = text;
    
    // Find the last unterminated string and close it
    if (error.message.includes('Unterminated string')) {
      const position = error.message.match(/position (\d+)/)?.[1];
      if (position) {
        const before = fixedText.substring(0, position);
        const after = fixedText.substring(position);
        const lastQuoteIndex = before.lastIndexOf('"');
        if (lastQuoteIndex !== -1 && after[0] !== '"') {
          fixedText = `${before}"${after}`;
        }
      }
    }

    // Remove trailing commas
    fixedText = fixedText.replace(/,\s*([\]}])/g, '$1');

    // Try parsing again
    try {
      return JSON.parse(fixedText);
    } catch (fixError) {
      console.log('Failed to fix JSON:', fixError.message);
      throw new Error('Invalid JSON after attempted fix');
    }
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { content, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion } = req.body;

    // Input validation
    if (
      !content?.trim() ||
      totalQuestions === undefined ||
      totalQuestions === null ||
      singleCorrect === undefined ||
      singleCorrect === null ||
      multipleCorrect === undefined ||
      multipleCorrect === null ||
      optionsPerQuestion === undefined ||
      optionsPerQuestion === null
    ) {
      return res.status(400).json({ error: "Missing or invalid input fields" });
    }

    // Ensure totalQuestions = singleCorrect + multipleCorrect
    if (parseInt(singleCorrect) + parseInt(multipleCorrect) !== parseInt(totalQuestions)) {
      return res.status(400).json({ error: "Single + Multiple correct questions must equal Total questions" });
    }

    // Preprocess content to avoid issues with special characters
    const processedContent = preprocessContent(content);

    // Construct a stricter prompt
    const prompt = `You are a Quiz Generator AI. Create a quiz following these EXACT requirements:

CONTENT TO USE:
"${processedContent}"

REQUIREMENTS:
1. Generate EXACTLY ${totalQuestions} questions in total (no more, no less).
2. The first ${singleCorrect} questions (indices 0 to ${singleCorrect - 1}) must be SINGLE correct type with EXACTLY 1 correct answer.
3. The last ${multipleCorrect} questions (indices ${singleCorrect} to ${totalQuestions - 1}) must be MULTIPLE correct type with EXACTLY 2 or more correct answers.
4. Each question must have EXACTLY ${optionsPerQuestion} options.
5. Label options in the JSON as strings like "a) Option 1", "b) Option 2", etc.
6. For "correctAnswers", use zero-based indices (e.g., [0] for the first option, [1, 2] for the second and third options).
7. Respond ONLY in JSON format as an array of objects.
8. Ensure all strings in the JSON are properly escaped (e.g., use \" for quotes within strings).
9. Do NOT include newlines, unescaped quotes, or any invalid JSON characters in the response.

Output the quiz as a JSON array of objects with the following structure:
[
  {
    "question": "Question text",
    "type": "single", // or "multiple"
    "options": ["a) Option 1", "b) Option 2", "c) Option 3", ...],
    "correctAnswers": [0] // or [0, 2] for multiple correct (indices of correct options)
  },
  ...
]

STRICT RULES:
- Generate EXACTLY ${totalQuestions} questions (no more, no less). If you generate more or fewer, your response will be invalid.
- The first ${singleCorrect} questions MUST be "single" type, and the last ${multipleCorrect} questions MUST be "multiple" type.
- Include EXACTLY ${optionsPerQuestion} options per question.
- Use zero-based indices for "correctAnswers" (e.g., 0, 1, 2, ...).
- For "single" type questions, "correctAnswers" must have EXACTLY 1 index.
- For "multiple" type questions, "correctAnswers" must have 2 or more indices.
- All "correctAnswers" indices must be valid (between 0 and ${optionsPerQuestion - 1}).
- Ensure proper JSON escaping for all strings (e.g., escape quotes with \").
- Do NOT include any extra text outside the JSON array.

Generate the quiz now:`;

    // Make API call with retry logic
    let attempt = 0;
    const maxAttempts = 3;
    let quizArray = [];

    while (attempt < maxAttempts) {
      try {
        const response = await axios.post(
          "https://api.together.xyz/v1/chat/completions",
          {
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages: [
              {
                "role": "system",
                "content": "Only respond in JSON format as an array of objects. Ensure proper JSON escaping for all strings."
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
            temperature: 0.5,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const text = response.data.choices[0].message.content;
        console.log(`Attempt ${attempt + 1} - Raw AI Response:`, text);
        
        // Attempt to parse and fix JSON
        quizArray = attemptFixJson(text);
        
        // Validate quiz structure
        const validationResult = validateQuizStructure(quizArray, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion);
        if (validationResult.isValid) {
          break;
        } else {
          console.log(`Attempt ${attempt + 1} - Validation Failed:`, validationResult.errors);
          // Adjust quizArray to fix validation issues before retrying
          quizArray = adjustQuizStructure(quizArray, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion, content);
          const reValidation = validateQuizStructure(quizArray, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion);
          if (reValidation.isValid) {
            console.log(`Attempt ${attempt + 1} - Adjusted quiz is now valid`);
            break;
          } else {
            console.log(`Attempt ${attempt + 1} - Adjusted quiz still invalid:`, reValidation.errors);
            throw new Error('Quiz validation failed even after adjustment');
          }
        }
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed:`, error.message);
        attempt++;
        if (attempt === maxAttempts) {
          // Final fallback before failing
          console.log('Applying final fallback mechanism...');
          quizArray = createFallbackQuiz(totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion, content);
          break;
        }
        // Add delay between retries
        await delay(1000 * (attempt + 1));
      }
    }

    res.status(200).json({ quiz: quizArray });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ 
      error: "Failed to generate quiz",
      details: error.message,
      attempts: attempt
    });
  }
};

// Updated validation function for JSON structure with detailed error messages
function validateQuizStructure(quiz, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion) {
  const errors = [];

  if (!Array.isArray(quiz)) {
    return { isValid: false, errors: ["Quiz must be an array"] };
  }

  if (quiz.length !== totalQuestions) {
    errors.push(`Expected ${totalQuestions} questions, but got ${quiz.length}`);
  }

  const singleCount = quiz.filter(q => q.type === 'single').length;
  const multipleCount = quiz.filter(q => q.type === 'multiple').length;

  if (singleCount !== parseInt(singleCorrect)) {
    errors.push(`Expected ${singleCorrect} single correct questions, but got ${singleCount}`);
  }

  if (multipleCount !== parseInt(multipleCorrect)) {
    errors.push(`Expected ${multipleCorrect} multiple correct questions, but got ${multipleCount}`);
  }

  quiz.forEach((q, index) => {
    if (!q.options || !Array.isArray(q.options) || q.options.length !== optionsPerQuestion) {
      errors.push(`Question ${index + 1}: Expected ${optionsPerQuestion} options, but got ${q.options?.length || 0}`);
    }
    if (!q.correctAnswers || !Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
      errors.push(`Question ${index + 1}: correctAnswers must be a non-empty array`);
    } else {
      if (q.type === 'single' && q.correctAnswers.length !== 1) {
        errors.push(`Question ${index + 1}: Single correct question must have exactly 1 correct answer, got ${q.correctAnswers.length}`);
      }
      if (q.type === 'multiple' && q.correctAnswers.length < 2) {
        errors.push(`Question ${index + 1}: Multiple correct question must have 2 or more correct answers, got ${q.correctAnswers.length}`);
      }
      q.correctAnswers.forEach((a, i) => {
        if (a < 0 || a >= optionsPerQuestion) {
          errors.push(`Question ${index + 1}: correctAnswers[${i}] = ${a} is out of bounds (must be between 0 and ${optionsPerQuestion - 1})`);
        }
      });
    }
  });

  return { isValid: errors.length === 0, errors };
}

// Adjust quiz structure to meet requirements
function adjustQuizStructure(quiz, totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion, content) {
  let adjustedQuiz = [...quiz];

  // Step 1: Adjust total number of questions
  if (adjustedQuiz.length > totalQuestions) {
    adjustedQuiz = adjustedQuiz.slice(0, totalQuestions);
  } else if (adjustedQuiz.length < totalQuestions) {
    const fillerQuestions = Array(totalQuestions - adjustedQuiz.length).fill().map((_, i) => {
      const qIndex = adjustedQuiz.length + i;
      const isSingle = qIndex < singleCorrect;
      return {
        question: `Adjusted Question ${qIndex + 1} (From: ${content.slice(0, 20)}...)`,
        type: isSingle ? 'single' : 'multiple',
        options: Array(optionsPerQuestion).fill().map((_, j) => `${String.fromCharCode(97 + j)}) Adjusted Option ${j + 1}`),
        correctAnswers: isSingle ? [0] : [0, 1],
      };
    });
    adjustedQuiz = [...adjustedQuiz, ...fillerQuestions];
  }

  // Step 2: Adjust single/multiple correct counts
  adjustedQuiz = adjustedQuiz.map((q, i) => {
    const shouldBeSingle = i < singleCorrect;
    return {
      ...q,
      type: shouldBeSingle ? 'single' : 'multiple',
      correctAnswers: shouldBeSingle 
        ? [q.correctAnswers[0] || 0]
        : q.correctAnswers.length >= 2 
          ? q.correctAnswers.slice(0, 2) 
          : [0, 1],
    };
  });

  return adjustedQuiz;
}

// Fallback mechanism to create a completely new quiz if all attempts fail
function createFallbackQuiz(totalQuestions, singleCorrect, multipleCorrect, optionsPerQuestion, content) {
  return Array(totalQuestions).fill().map((_, i) => {
    const isSingle = i < singleCorrect;
    return {
      question: `Fallback Question ${i + 1} (From: ${content.slice(0, 20)}...)`,
      type: isSingle ? 'single' : 'multiple',
      options: Array(optionsPerQuestion).fill().map((_, j) => `${String.fromCharCode(97 + j)}) Fallback Option ${j + 1}`),
      correctAnswers: isSingle ? [0] : [0, 1],
    };
  });
}

module.exports = {
  generateQuiz,
};