import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { Search, Loader2, CheckCircle, XCircle } from 'lucide-react';

const QuizTaking = () => {
  const [quizId, setQuizId] = useState('');
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { quizData, setUserAnswers, resetQuiz } = useQuiz();
  const { user } = useAuth();

  // Initialize answers when quizData changes
  useEffect(() => {
    if (quizData && quizData.length > 0) {
      setAnswers(Array(quizData.length).fill([]));
    }
  }, [quizData]);

  const handleFindQuiz = () => {
    if (quizId.trim()) {
      navigate(`/take/${quizId.trim()}`);
    }
  };

  const handleOptionChange = (qIdx, optIdx, type) => {
    setAnswers(prev => {
      const updated = [...prev];
      if (type === 'single') {
        updated[qIdx] = [optIdx];
      } else {
        if (updated[qIdx].includes(optIdx)) {
          updated[qIdx] = updated[qIdx].filter(i => i !== optIdx);
        } else {
          updated[qIdx] = [...updated[qIdx], optIdx];
        }
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    
    // Calculate score and details
    let score = 0, correctAnswers = 0, incorrectAnswers = 0;
    const details = quizData.map((q, idx) => {
      const userAns = answers[idx] || [];
      const correctAns = q.correctAnswers || [];
      const isCorrect =
        q.type === 'single'
          ? userAns.length === 1 && userAns[0] === correctAns[0]
          : userAns.length > 0 &&
            userAns.every(a => correctAns.includes(a)) &&
            correctAns.every(a => userAns.includes(a));
      if (isCorrect) {
        score += 1;
        correctAnswers += 1;
      } else {
        incorrectAnswers += 1;
      }
      return {
        question: q.question,
        userAnswer: userAns.map(i => q.options[i]).join(', ') || 'Not answered',
        correctAnswer: correctAns.map(i => q.options[i]).join(', '),
        isCorrect,
        score: isCorrect ? 1 : 0,
        type: q.type
      };
    });

    setResult({ score, correctAnswers, incorrectAnswers, details });
    setUserAnswers(answers);
    setShowResults(true);
    setSubmitting(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = () => {
    navigate('/result');
  };

  // If we have quiz data, show the quiz
  if (quizData && quizData.length > 0) {
    if (showResults) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full border border-blue-100">
            <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Quiz Completed!</h2>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-blue-600">
                {result.score} / {quizData.length}
              </p>
              <p className="text-gray-600 mt-2">
                Correct: {result.correctAnswers} | Incorrect: {result.incorrectAnswers}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={finishQuiz}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition"
              >
                View Detailed Results
              </button>
              <button
                onClick={() => {
                  resetQuiz();
                  navigate('/');
                }}
                className="w-full bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-700 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentQ = quizData[currentQuestion];

    // Compute status for each question
    const getStatus = (idx) => {
      if (currentQuestion === idx) return 'current';
      if (answers[idx] && answers[idx].length > 0) return 'attempted';
      return 'not_attempted';
    };

    // Sidebar/Topbar navigator
    const QuestionNavigator = () => (
      <>
        {/* Desktop: vertical sidebar */}
        <div className="hidden md:flex flex-col gap-2 items-center py-6 px-2 bg-white/80 rounded-2xl shadow-lg border border-blue-100 mr-8 min-w-[64px] sticky top-8 h-fit max-h-[80vh] overflow-y-auto">
          {quizData.map((_, idx) => {
            const status = getStatus(idx);
            let base = 'w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg cursor-pointer border-2 transition-all duration-200 mb-1';
            let color = '';
            if (status === 'current') color = 'border-blue-500 bg-blue-100 text-blue-700 scale-110 shadow-lg';
            else if (status === 'attempted') color = 'border-green-500 bg-green-100 text-green-700';
            else color = 'border-gray-300 bg-gray-100 text-gray-400';
            return (
              <div
                key={idx}
                className={`${base} ${color}`}
                title={status === 'current' ? 'Current' : status === 'attempted' ? 'Attempted' : 'Not Attempted'}
                onClick={() => setCurrentQuestion(idx)}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
        {/* Mobile: horizontal bar */}
        <div className="md:hidden flex gap-2 items-center py-3 px-2 bg-white/80 rounded-xl shadow-lg border border-blue-100 mb-4 overflow-x-auto sticky top-2 z-10">
          {quizData.map((_, idx) => {
            const status = getStatus(idx);
            let base = 'w-9 h-9 flex items-center justify-center rounded-full font-bold text-base cursor-pointer border-2 transition-all duration-200';
            let color = '';
            if (status === 'current') color = 'border-blue-500 bg-blue-100 text-blue-700 scale-110 shadow-lg';
            else if (status === 'attempted') color = 'border-green-500 bg-green-100 text-green-700';
            else color = 'border-gray-300 bg-gray-100 text-gray-400';
            return (
              <div
                key={idx}
                className={`${base} ${color}`}
                title={status === 'current' ? 'Current' : status === 'attempted' ? 'Attempted' : 'Not Attempted'}
                onClick={() => setCurrentQuestion(idx)}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-2 md:px-4">
        <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden relative">
          {/* Sidebar for desktop */}
          <QuestionNavigator />
          {/* Main quiz area */}
          <div className="flex-1 p-6 sm:p-10">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {quizData.length}</span>
                <span>{Math.round(((currentQuestion + 1) / quizData.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Mobile: show topbar navigator */}
            <div className="block md:hidden mb-2">
              {/* Already rendered in QuestionNavigator */}
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {currentQuestion + 1}. {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type={currentQ.type === 'single' ? 'radio' : 'checkbox'}
                    name={`q-${currentQuestion}`}
                    checked={answers[currentQuestion]?.includes(optIdx) || false}
                    onChange={() => handleOptionChange(currentQuestion, optIdx, currentQ.type)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                {currentQuestion + 1} of {quizData.length}
              </div>
              {currentQuestion === quizData.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no quiz data, show the ID input form for shared quizzes
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-10 border border-white text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Take a Shared Quiz</h1>
        <p className="text-gray-600 mb-8 text-lg">Enter the Quiz ID below to begin.</p>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleFindQuiz();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            placeholder="Enter Quiz ID..."
            className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold"
          >
            <Search size={20} />
            Find
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizTaking;