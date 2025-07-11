import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuiz } from '../../context/QuizContext';
import {
  Calendar, Clock, ChevronDown, ChevronUp, User as UserIcon, Edit2, Award, Star, Trophy, PenTool, BarChart3, Smile, Zap, CheckCircle
} from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour < 18) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
};

const getStreak = (history) => {
  // Simple streak: count unique days with activity
  const days = new Set((history?.taken || []).map(q => new Date(q.date).toDateString()));
  return days.size;
};

const getBestScore = (history) => {
  return (history?.taken || []).reduce((max, q) => Math.max(max, q.score || 0), 0);
};

const getBadges = (history) => {
  const taken = history?.taken?.length || 0;
  const created = history?.created?.length || 0;
  const badges = [];
  if (taken >= 10) badges.push({ icon: <Trophy className="text-yellow-500" />, label: 'Quiz Champ' });
  if (created >= 5) badges.push({ icon: <PenTool className="text-purple-500" />, label: 'Quiz Creator' });
  if (getStreak(history) >= 3) badges.push({ icon: <Zap className="text-pink-500" />, label: 'Streak Master' });
  if (getBestScore(history) >= 8) badges.push({ icon: <Star className="text-blue-500" />, label: 'High Scorer' });
  return badges;
};

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
        alert(error.message);
      }
    };
    reader.onerror = (error) => {
      alert('Failed to read file.');
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
              <p className={`text-sm ${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}>Your Answer: {detail.userAnswer || 'Not answered'}</p>
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
                  <p key={optIdx} className={`text-sm ${(question.correctAnswers || []).includes(optIdx) ? 'text-green-600 font-medium' : ''}`}>{String.fromCharCode(97 + optIdx)}) {option}</p>
                ))}
              </div>
              <p className="text-sm mt-1">Marks: {question.marks || 1}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  // Stats
  const taken = quizHistory?.taken?.length || 0;
  const created = quizHistory?.created?.length || 0;
  const streak = getStreak(quizHistory);
  const bestScore = getBestScore(quizHistory);
  const badges = getBadges(quizHistory);
  const greeting = getGreeting();

  // Progress ring for avatar
  const progress = Math.min(100, (taken + created) * 5); // fake progress for demo

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white">
        {/* Top: Avatar, Greeting, Badges */}
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
          <div className="relative group flex-shrink-0">
            {/* Progress ring */}
            <svg className="absolute -top-2 -left-2" width="140" height="140">
              <circle cx="70" cy="70" r="64" fill="none" stroke="#e0e7ff" strokeWidth="8" />
              <circle
                cx="70" cy="70" r="64" fill="none"
                stroke="#6366f1"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s' }}
              />
            </svg>
            {user?.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-300">
                <UserIcon size={64} className="text-gray-500" />
              </div>
            )}
            <div 
              className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity z-20"
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
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="text-2xl font-bold">{greeting.text}, {user?.username || 'User'}!</span>
              <span className="text-2xl animate-bounce">{greeting.emoji}</span>
            </div>
            <p className="text-lg text-gray-600 mb-2">{user?.email || 'N/A'}</p>
            {/* Badges */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-2">
              {badges.length === 0 ? (
                <span className="text-gray-400 text-sm">No badges yet. Keep quizzing!</span>
              ) : (
                badges.map((badge, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-full shadow text-sm font-semibold animate-pulse">
                    {badge.icon} {badge.label}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-blue-100 rounded-xl p-4 flex flex-col items-center shadow-md">
            <BarChart3 className="text-blue-600 mb-1" size={28} />
            <span className="text-2xl font-bold text-blue-700">{taken}</span>
            <span className="text-sm text-gray-700">Quizzes Taken</span>
          </div>
          <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center shadow-md">
            <PenTool className="text-purple-600 mb-1" size={28} />
            <span className="text-2xl font-bold text-purple-700">{created}</span>
            <span className="text-sm text-gray-700">Quizzes Created</span>
          </div>
          <div className="bg-pink-100 rounded-xl p-4 flex flex-col items-center shadow-md">
            <Star className="text-pink-600 mb-1" size={28} />
            <span className="text-2xl font-bold text-pink-700">{bestScore}</span>
            <span className="text-sm text-gray-700">Best Score</span>
          </div>
          <div className="bg-green-100 rounded-xl p-4 flex flex-col items-center shadow-md">
            <Smile className="text-green-600 mb-1" size={28} />
            <span className="text-2xl font-bold text-green-700">{streak}</span>
            <span className="text-sm text-gray-700">Active Days</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b pb-4 justify-center">
          <button
            className={`px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 ${activeTab === 'taken' ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('taken')}
          >
            <BarChart3 className="w-5 h-5" /> Taken
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 ${activeTab === 'created' ? 'bg-purple-600 text-white shadow-md scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('created')}
          >
            <PenTool className="w-5 h-5" /> Created
          </button>
        </div>
        {/* Quiz History Timeline */}
        {loading ? (
          <div className="text-center py-4">Loading quiz history...</div>
        ) : quizHistory[activeTab]?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No {activeTab} quiz history available.</div>
        ) : (
          <div className="relative pl-6 before:absolute before:top-0 before:left-2 before:w-1 before:h-full before:bg-gradient-to-b before:from-blue-200 before:to-pink-200 before:rounded-full">
            {quizHistory[activeTab]?.map((quiz, index) => (
              <div key={index} className="relative mb-8">
                <div className="absolute left-[-10px] top-2 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 border-4 border-white flex items-center justify-center shadow">
                  {activeTab === 'taken' ? <CheckCircle className="text-white w-3 h-3" /> : <PenTool className="text-white w-3 h-3" />}
                </div>
                <div
                  className={`ml-8 border rounded-xl p-4 bg-white/80 shadow-md transition-all duration-300 cursor-pointer ${expandedQuiz === (quiz.quizId || index) ? 'scale-105 border-blue-400' : 'hover:scale-105 hover:border-pink-400'}`}
                  onClick={() => toggleQuizDetails(quiz.quizId || index)}
                >
                  <div className="flex justify-between items-start">
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
                          <p className="font-semibold text-xl text-blue-600">{quiz.score?.toFixed(2)} / {quiz.totalQuestions}</p>
                          <p className="text-sm text-gray-500">{quiz.correctAnswers} Correct</p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;