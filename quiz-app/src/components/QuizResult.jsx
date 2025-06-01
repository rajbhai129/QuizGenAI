import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const QuizResult = () => {
  const { quizData, userAnswers } = useQuiz();
  const navigate = useNavigate();

  if (!quizData || quizData.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">No quiz data found!</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Calculate score and stats
  let totalScore = 0;
  let correctQuestions = 0;
  let incorrectQuestions = 0;
  const questionResults = quizData.map((question, index) => {
    const userAns = userAnswers[index] || []; // ["a", "c"]
    const correctAns = question.correctAnswers; // [0, 2]

    // Convert user answers (labels like "a", "c") to indices
    const userIndices = userAns
      .map(ans => ans.charCodeAt(0) - 97) // Convert "a" -> 0, "c" -> 2
      .filter(idx => idx >= 0 && idx < question.options.length);

    // Check if user selected any wrong options
    const hasWrong = userIndices.some(idx => !correctAns.includes(idx));

    let questionScore = 0;
    let isCorrect = false;

    if (question.type === "single") {
      // Single correct: exact match for 1 mark
      if (userIndices.length === 1 && userIndices[0] === correctAns[0]) {
        questionScore = 1;
        isCorrect = true;
        correctQuestions++;
      } else {
        incorrectQuestions++;
      }
    } else {
      // Multiple correct: partial marks if no wrong selections
      if (hasWrong || userIndices.length === 0) {
        questionScore = 0;
        incorrectQuestions++;
      } else {
        const correctSelected = userIndices.filter(idx => correctAns.includes(idx)).length;
        questionScore = (correctSelected / correctAns.length);
        if (correctSelected === correctAns.length) {
          isCorrect = true;
          correctQuestions++;
        } else {
          incorrectQuestions++;
        }
      }
    }

    totalScore += questionScore;

    return {
      question: question.question,
      userAnswer: userAns.map(idx => question.options[idx.charCodeAt(0) - 97]).join(", ") || "Not answered",
      correctAnswer: correctAns.map(idx => question.options[idx]).join(", "),
      isCorrect,
      score: questionScore,
      type: question.type
    };
  });

  // Data for pie chart
  const pieData = [
    { name: 'Correct', value: correctQuestions, color: '#10B981' },
    { name: 'Incorrect', value: incorrectQuestions, color: '#EF4444' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Quiz Results
      </h1>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Your Score</h2>
            <p className="text-4xl font-bold text-blue-600">
              {totalScore.toFixed(2)} / {quizData.length}
            </p>
            <p className="text-gray-600 mt-2">
              Correct: {correctQuestions} | Incorrect: {incorrectQuestions}
            </p>
          </div>
          <div className="w-48 h-48">
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      {/* Question-wise Feedback */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Question-wise Breakdown</h2>
        {questionResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 mb-4 rounded-lg border-l-4 ${
              result.isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}
          >
            <h3 className="font-semibold text-gray-800">
              {index + 1}. {result.question} ({result.type})
            </h3>
            <p className="text-gray-700 mt-1">
              <span className="font-medium">Your Answer:</span> {result.userAnswer}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Correct Answer:</span> {result.correctAnswer}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Score:</span> {result.score.toFixed(2)} / 1
            </p>
            <p className={`mt-1 font-medium ${
              result.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.isCorrect ? 'Correct' : 'Incorrect'}
            </p>
          </div>
        ))}
      </div>

      {/* Back to Home Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default QuizResult;