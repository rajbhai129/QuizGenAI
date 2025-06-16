import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const ManualQuizCreator = () => {
  const [questions, setQuestions] = useState([{
    question: '',
    type: 'single',
    options: ['', '', '', ''],
    correctAnswers: []
  }]);
  const navigate = useNavigate();
  const { setQuizData } = useQuiz();

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      type: 'single',
      options: ['', '', '', ''],
      correctAnswers: []
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
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
        question.correctAnswers = [...currentAnswers, optionIndex];
      }
    }
    
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    // Validate questions
    const isValid = questions.every(q => 
      q.question.trim() !== '' && 
      q.options.every(opt => opt.trim() !== '') &&
      q.correctAnswers.length > 0 &&
      (q.type === 'single' ? q.correctAnswers.length === 1 : q.correctAnswers.length >= 2)
    );

    if (!isValid) {
      alert('Please fill all questions, options and select correct answers correctly.');
      return;
    }

    setQuizData(questions);
    navigate('/take');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Create Quiz Manually</h1>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
              Back to AI Generator
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter your question"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="single">Single Correct</option>
                    <option value="multiple">Multiple Correct</option>
                  </select>
                </div>

                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type={question.type === 'single' ? 'radio' : 'checkbox'}
                        checked={question.correctAnswers.includes(oIndex)}
                        onChange={() => toggleCorrectAnswer(qIndex, oIndex)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(97 + oIndex)})`}
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Question
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={20} />
              Save Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualQuizCreator;