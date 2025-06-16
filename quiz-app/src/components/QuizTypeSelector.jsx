import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PenTool } from 'lucide-react';

const QuizTypeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Choose Quiz Creation Method</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Quiz Generator */}
          <div 
            onClick={() => navigate('/create')}
            className="bg-white p-8 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">AI Quiz Generator</h2>
            <p className="text-gray-600 mb-4">
              Upload content or paste text to automatically generate quiz questions using AI.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Use AI Generator
            </button>
          </div>

          {/* Manual Quiz Creator */}
          <div 
            onClick={() => navigate('/manual')}
            className="bg-white p-8 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <PenTool size={32} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manual Quiz Creator</h2>
            <p className="text-gray-600 mb-4">
              Create your own custom quiz by manually adding questions and answers.
            </p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              Create Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTypeSelector;