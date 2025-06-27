import React, { useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const QuizSubmit = () => {
  const { sharedQuizResult, sharedQuizMeta } = useQuiz();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sharedQuizResult) {
      navigate('/');
    }
  }, [sharedQuizResult, navigate]);

  if (!sharedQuizResult) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full border border-blue-100 text-center">
        <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Thank you for taking the quiz!</h2>
        {sharedQuizMeta && (
          <div className="text-center text-gray-500 mb-2">
            <span>Quiz: <span className="font-semibold text-blue-600">{sharedQuizMeta.title || 'Shared Quiz'}</span></span>
            {sharedQuizMeta.owner && <span className="ml-2">by <span className="font-semibold">{sharedQuizMeta.owner}</span></span>}
            {sharedQuizMeta.createdAt && <span className="ml-2">on {new Date(sharedQuizMeta.createdAt).toLocaleString()}</span>}
          </div>
        )}
        <p className="mb-4 text-lg text-gray-600">You scored <span className="font-bold text-blue-600">{sharedQuizResult.score} / {sharedQuizResult.details.length}</span></p>
        <div className="mb-4">
          <p className="text-green-600 font-semibold">Correct: {sharedQuizResult.correctAnswers}</p>
          <p className="text-red-500 font-semibold">Incorrect: {sharedQuizResult.incorrectAnswers}</p>
        </div>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={() => navigate('/result')}
        >
          See Detailed Result
        </button>
        <button onClick={() => navigate('/')} className="mt-4 ml-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Back to Home</button>
      </div>
    </div>
  );
};

export default QuizSubmit; 