import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-blue-100 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Thank You for Attempting the Quiz!</h2>
        <p className="text-gray-600 mb-8">Your responses have been submitted successfully.</p>
        <button
          onClick={() => navigate('/result')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
        >
          View Result
        </button>
      </div>
    </div>
  );
};

export default ThankYou; 