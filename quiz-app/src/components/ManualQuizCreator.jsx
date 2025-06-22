import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { Plus, Trash2, Save, Link as LinkIcon, CheckCircle } from 'lucide-react';

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
  const [shareModal, setShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

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
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-blue-200">
            <LinkIcon className="mx-auto text-blue-500 mb-2" size={40} />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Quiz Created!</h2>
            <p className="mb-4 text-gray-600">Share this link with anyone to let them take your quiz:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 text-sm"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-lg font-semibold transition ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {copied ? <><CheckCircle className="inline mr-1" size={18}/>Copied!</> : 'Copy Link'}
              </button>
            </div>
            <button
              onClick={() => setShareModal(false)}
              className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Create Quiz Manually</h1>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Question {qIndex + 1}</h2>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qIndex)} className="text-red-500">
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
                className="w-full p-2 border rounded"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  className="p-2 border rounded"
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
                  className="p-2 border rounded"
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
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(97 + oIndex)}`}
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus size={20} />
            Add Question
          </button>

          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Save size={20} />
            Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualQuizCreator;