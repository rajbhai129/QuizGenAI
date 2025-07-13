import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, Link as LinkIcon, CheckCircle, Info, Eye, FileText } from 'lucide-react';

const ManualQuizCreator = () => {
  const [questions, setQuestions] = useState([{
    question: '',
    type: 'single',
    marks: 1,
    options: ['', '', '', ''],
    correctAnswers: []
  }]);
  const navigate = useNavigate();
  const { setQuizData, fetchQuizHistory } = useQuiz();
  const { user } = useAuth();
  const [shareModal, setShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [guestLimitModal, setGuestLimitModal] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      type: 'single',
      marks: 1,
      options: ['', '', '', ''],
      correctAnswers: []
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const toggleCorrectAnswer = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.type === 'single') {
      question.correctAnswers = [optionIndex];
    } else {
      const currentAnswers = question.correctAnswers;
      if (currentAnswers.includes(optionIndex)) {
        question.correctAnswers = currentAnswers.filter(i => i !== optionIndex);
      } else {
        question.correctAnswers.push(optionIndex);
      }
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    const isValid = questions.every(q => 
      q.question.trim() !== '' && 
      q.options.every(opt => opt.trim() !== '') &&
      q.correctAnswers.length > 0
    );

    if (!isValid) {
      alert('Please fill all questions, options and select correct answers.');
      return;
    }

    try {
      // Save quiz as shared quiz
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          details: questions,
          title: 'Manual Quiz',
          description: ''
        })
      });
      const data = await res.json();
      if (res.ok && data.quizId) {
        const link = `${window.location.origin}/take/${data.quizId}`;
        setShareLink(link);
        setShareModal(true);
      } else {
        throw new Error(data.error || 'Failed to create quiz');
      }
    } catch (error) {
      if (error.message && error.message.includes('Guest account can only create 2 quizzes')) {
        setGuestLimitModal(true);
      } else {
        alert('Failed to save quiz: ' + error.message);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Stepper visual
  const Stepper = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {questions.map((_, idx) => (
        <div key={idx} className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${idx === questions.length-1 ? 'border-pink-500 bg-pink-100' : 'border-blue-400 bg-blue-100'} font-bold text-lg text-blue-700`}>{idx+1}</div>
      ))}
      <span className="ml-2 text-gray-500 text-sm">Step {questions.length}</span>
    </div>
  );

  // Preview modal
  const PreviewModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-left border-2 border-blue-200 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2"><Eye className="text-blue-500" /> Quiz Preview</h2>
        {questions.map((q, i) => (
          <div key={i} className="mb-6">
            <h3 className="font-semibold text-lg mb-1">{i+1}. {q.question}</h3>
            <div className="ml-4">
              {q.options.map((opt, j) => (
                <div key={j} className="flex items-center gap-2 mb-1">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full border ${q.correctAnswers.includes(j) ? 'bg-green-200 border-green-500' : 'bg-gray-100 border-gray-300'}`}>{String.fromCharCode(97+j)})</span>
                  <span className={q.correctAnswers.includes(j) ? 'text-green-700 font-semibold' : ''}>{opt}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">Type: {q.type === 'single' ? 'Single Correct' : 'Multiple Correct'} | Marks: {q.marks}</div>
          </div>
        ))}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={() => setShowPreview(false)} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-16 px-4 overflow-hidden">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-0 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0 animation-delay-2000" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0 animation-delay-4000" style={{animationDelay: '4s'}}></div>
      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border-2 border-blue-200">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <LinkIcon className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">🎉 Quiz Created Successfully!</h2>
            <p className="mb-6 text-gray-600">What would you like to do with your quiz?</p>
            
            {/* Quiz Stats */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">📊 Quiz Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                  <div className="text-xs text-gray-600">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {questions.filter(q => q.type === 'single').length}
                  </div>
                  <div className="text-xs text-gray-600">Single Choice</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {questions.filter(q => q.type === 'multiple').length}
                  </div>
                  <div className="text-xs text-gray-600">Multiple Choice</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4 mb-6">
              {/* Take Quiz Now */}
              <button
                onClick={() => {
                  setShareModal(false);
                  navigate('/take');
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                🎯 Take Quiz Now
                <span className="text-sm opacity-90">(Start immediately)</span>
              </button>
              
              {/* Share Link */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">📤 Share with Others</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-white text-gray-700 text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {copied ? <><CheckCircle className="inline mr-1" size={16}/>Copied!</> : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-blue-600">Share this link with friends, students, or colleagues</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  setShareModal(false);
                  navigate('/profile');
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              >
                📊 View History
              </button>
              <button
                onClick={() => {
                  setShareModal(false);
                  navigate('/create');
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
              >
                ➕ Create Another
              </button>
            </div>
            
            <button
              onClick={() => setShareModal(false)}
              className="w-full text-gray-500 hover:text-gray-700 transition py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {showPreview && <PreviewModal />}
      
      {/* Guest Limit Modal */}
      {guestLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-orange-200">
            <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="text-orange-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Quiz Limit Reached! 🎯</h2>
            <p className="mb-6 text-gray-600">You've created 2 quizzes as a guest. Register now for unlimited access!</p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setGuestLimitModal(false);
                  navigate('/register');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🚀 Register for Unlimited Access
              </button>
              
              <button
                onClick={() => {
                  setGuestLimitModal(false);
                  navigate('/login');
                }}
                className="w-full bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-700 transition"
              >
                🔐 Login to Existing Account
              </button>
              
              <button
                onClick={() => setGuestLimitModal(false)}
                className="w-full text-gray-500 hover:text-gray-700 transition"
              >
                Maybe Later
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Benefits of registering:</strong><br/>
                • Unlimited quiz creation<br/>
                • Save quiz history<br/>
                • Analytics & insights<br/>
                • Custom profile
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border-t-4 border-pink-400 backdrop-blur-md mb-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 drop-shadow mb-2">Manual Quiz Creator</h1>
            <p className="text-lg text-gray-600">Design your own quiz step by step. Add questions, set correct answers, and preview before sharing!</p>
            {user?.email === 'guest@quizgenai.com' && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  🎯 Guest Mode: You can create 2 quizzes. Register for unlimited access!
                </p>
              </div>
            )}
          </div>
          <Stepper />
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white/80 rounded-xl shadow p-6 mb-8 border border-blue-100 relative">
              <div className="flex justify-between mb-4 items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">Question {qIndex + 1} <Info className="text-blue-400" title="Fill the question, options, and select correct answer(s)" /></h2>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 transition" title="Remove this question">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="Enter question"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-300"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="single">Single Correct</option>
                    <option value="multiple">Multiple Correct</option>
                  </select>
                  <input
                    type="number"
                    value={question.marks}
                    min="1"
                    onChange={(e) => updateQuestion(qIndex, 'marks', Number(e.target.value))}
                    placeholder="Marks"
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type={question.type === 'single' ? 'radio' : 'checkbox'}
                        name={`question-${qIndex}`}
                        checked={question.correctAnswers.includes(oIndex)}
                        onChange={() => toggleCorrectAnswer(qIndex, oIndex)}
                        className="w-4 h-4 accent-pink-500"
                        title={question.type === 'single' ? 'Select the correct answer' : 'Select all correct answers'}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(97 + oIndex)}`}
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition"
            >
              <Plus size={20} />
              Add Question
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-lg transition"
              >
                <Eye size={20} />
                Preview Quiz
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg transition"
              >
                <Save size={20} />
                Save & Share
              </button>
            </div>
          </div>
          
          {/* Quick Take Quiz Button (when questions are ready) */}
          {questions.length > 0 && questions.every(q => q.question.trim() && q.correctAnswers.length > 0) && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setQuizData(questions);
                  navigate('/take');
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 flex justify-center items-center text-lg"
              >
                🎯 Take This Quiz Now
              </button>
              <p className="text-sm text-gray-500 mt-2">Test your quiz before sharing!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ManualQuizCreator;