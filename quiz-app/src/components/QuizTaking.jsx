import React, { useEffect, useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useNavigate } from 'react-router-dom';

const QuizTaking = () => {
  const { quizData, setUserAnswers } = useQuiz(); // <-- use quizData
  const [responses, setResponses] = useState({});
  const navigate = useNavigate();

  // Redirect to /create if quiz is not loaded
  useEffect(() => {
    if (!quizData || quizData.length === 0) {
      navigate('/create');
    }
  }, [quizData, navigate]);

  const handleChange = (index, option) => {
    const question = quizData[index];
    const isMultiple = question.type === "multiple";
    setResponses((prev) => {
      const current = prev[index] || [];
      if (isMultiple) {
        const updated = current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option];
        return { ...prev, [index]: updated };
      } else {
        return { ...prev, [index]: [option] };
      }
    });
  };

  const handleSubmit = () => {
    setUserAnswers(responses);
    navigate('/result');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Take Quiz</h2>
      {quizData && quizData.length > 0 ? (
        quizData.map((q, index) => (
          <div key={index} className="mb-6">
            <h3 className="font-semibold mb-2">
              {index + 1}. {q.question}
            </h3>
            {q.options.map((opt, i) => {
              const optionLabel =
                opt.match(/^[a-d]\)/i)?.[0] || String.fromCharCode(97 + i) + ')';
              return (
                <div key={i} className="ml-4">
                  <label>
                    <input
                      type={q.type === "multiple" ? 'checkbox' : 'radio'} // Changed to use q.type
                      name={`question-${index}`}
                      value={optionLabel}
                      checked={responses[index]?.includes(optionLabel)}
                      onChange={() => handleChange(index, optionLabel)}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <p>No quiz loaded.</p>
      )}
      {quizData && quizData.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizTaking;