import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const QuizTaking = () => {
  const [quizId, setQuizId] = useState('');
  const navigate = useNavigate();

  const handleFindQuiz = () => {
    if (quizId.trim()) {
      navigate(`/take/${quizId.trim()}`);
    }
  };

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