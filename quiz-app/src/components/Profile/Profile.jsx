import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuiz } from '../../context/QuizContext';
import { Calendar, Clock, ChevronDown, ChevronUp, User as UserIcon, Edit2 } from 'lucide-react';

const Profile = () => {
  const { user, updateUserAvatar } = useAuth();
  const { quizHistory, fetchQuizHistory } = useQuiz();
  const [activeTab, setActiveTab] = useState('taken');
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      await fetchQuizHistory();
      setLoading(false);
    };
    loadHistory();
  }, [fetchQuizHistory]);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/avatar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ avatar: base64String })
        });
        const data = await response.json();
        if (response.ok) {
          updateUserAvatar(data.avatar);
        } else {
          throw new Error(data.error || 'Failed to update avatar');
        }
      } catch (error) {
        console.error('Avatar upload error:', error);
        alert(error.message);
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Failed to read file.");
    };
  };

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
                    (question.correctAnswers || []).includes(optIdx) ? 'text-green-600 font-medium' : ''
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white">
        
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative group">
            {user?.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"/>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                <UserIcon size={64} className="text-gray-500" />
              </div>
            )}
            <div 
              className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity"
              onClick={handleAvatarClick}
            >
              <Edit2 size={32} className="text-white opacity-0 group-hover:opacity-100" />
            </div>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-800">{user?.username || 'N/A'}</h1>
            <p className="text-lg text-gray-600">{user?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl shadow-inner p-6">
          <div className="flex gap-4 mb-6 border-b pb-4">
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'taken' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('taken')}
            >
              Quizzes Taken
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'created' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('created')}
            >
              Quizzes Created
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading quiz history...</div>
          ) : quizHistory[activeTab]?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No {activeTab} quiz history available.
            </div>
          ) : (
            <div className="space-y-4">
              {quizHistory[activeTab]?.map((quiz, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleQuizDetails(quiz.quizId || index)}
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Quiz #{quiz.quizId || index + 1}</h3>
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
                          <p className="font-semibold text-xl text-blue-600">
                            {quiz.score?.toFixed(2)} / {quiz.totalQuestions}
                          </p>
                          <p className="text-sm text-gray-500">
                            {quiz.correctAnswers} Correct
                          </p>
                        </div>
                      )}
                      {expandedQuiz === (quiz.quizId || index) ? (
                        <ChevronUp size={24} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={24} className="text-gray-600" />
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