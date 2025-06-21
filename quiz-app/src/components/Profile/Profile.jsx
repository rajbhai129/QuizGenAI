import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuiz } from '../../context/QuizContext';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { quizHistory, fetchQuizHistory } = useQuiz();
  const [activeTab, setActiveTab] = useState('taken');
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      await fetchQuizHistory();
      setLoading(false);
    };
    loadHistory();
  }, [fetchQuizHistory]);

  const toggleQuizDetails = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const renderQuizDetails = (quiz) => {
    if (activeTab === 'taken') {
      return (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Question Details:</h4>
          {quiz.details?.map((detail, idx) => (
            <div key={idx} className="mb-4 border-b pb-2">
              <p className="font-medium">{idx + 1}. {detail.question}</p>
              <p className={`text-sm ${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                Your Answer: {detail.userAnswer || 'Not answered'}
              </p>
              <p className="text-sm text-gray-600">Correct Answer: {detail.correctAnswer}</p>
              <p className="text-sm">Score: {detail.score} / 1</p>
            </div>
          ))}
        </div>
      );
    } else {
      // Created quiz details
      return (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Quiz Questions:</h4>
          {quiz.details?.map((question, idx) => (
            <div key={idx} className="mb-4 border-b pb-2">
              <p className="font-medium">{idx + 1}. {question.question}</p>
              <p className="text-sm text-gray-600">Type: {question.type}</p>
              <div className="ml-4">
                {question.options?.map((option, optIdx) => (
                  <p key={optIdx} className={`text-sm ${
                    question.correctAnswers.includes(optIdx) ? 'text-green-600 font-medium' : ''
                  }`}>
                    {String.fromCharCode(97 + optIdx)}) {option}
                  </p>
                ))}
              </div>
              <p className="text-sm mt-1">Marks: {question.marks || 1}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Username</p>
              <p className="font-semibold">{user?.username || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Quiz History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex gap-4 mb-6">
            <button
              className={`px-6 py-2 rounded-lg ${
                activeTab === 'taken' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('taken')}
            >
              Quizzes Taken
            </button>
            <button
              className={`px-6 py-2 rounded-lg ${
                activeTab === 'created' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('created')}
            >
              Quizzes Created
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : quizHistory[activeTab]?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No {activeTab} quiz history available
            </div>
          ) : (
            <div className="space-y-4">
              {quizHistory[activeTab]?.map((quiz, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleQuizDetails(quiz.quizId || index)}
                  >
                    <div>
                      <h3 className="font-semibold">Quiz #{quiz.quizId || index + 1}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar size={16} className="mr-1" />
                        {new Date(quiz.date).toLocaleDateString()}
                        <Clock size={16} className="ml-3 mr-1" />
                        {new Date(quiz.date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {activeTab === 'taken' && (
                        <div className="text-right mr-4">
                          <p className="font-semibold text-blue-600">
                            Score: {quiz.score?.toFixed(2)} / {quiz.totalQuestions}
                          </p>
                          <p className="text-sm text-gray-500">
                            Correct: {quiz.correctAnswers} | Incorrect: {quiz.incorrectAnswers}
                          </p>
                        </div>
                      )}
                      {expandedQuiz === (quiz.quizId || index) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {expandedQuiz === (quiz.quizId || index) && renderQuizDetails(quiz)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;