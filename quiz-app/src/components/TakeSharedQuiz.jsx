import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

const TakeSharedQuiz = () => {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setSharedQuizResult, setSharedQuizMeta } = useQuiz();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [owner, setOwner] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${quizId}`);
        const data = await res.json();
        if (res.ok && data.quiz) {
          setQuiz(data.quiz);
          setAnswers(Array(data.quiz.details.length).fill([]));
          setCreatedAt(data.quiz.createdAt);
          // Fetch owner username
          if (data.quiz.creator) {
            const userRes = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user/${data.quiz.creator}`);
            const userData = await userRes.json();
            if (userRes.ok && userData.username) setOwner(userData.username);
          }
        } else {
          setError(data.error || 'Quiz not found');
        }
      } catch (err) {
        setError('Failed to load quiz.');
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (qIdx, optIdx, type) => {
    setAnswers(prev => {
      const updated = [...prev];
      if (type === 'single') {
        updated[qIdx] = [optIdx];
      } else {
        if (updated[qIdx].includes(optIdx)) {
          updated[qIdx] = updated[qIdx].filter(i => i !== optIdx);
        } else {
          updated[qIdx] = [...updated[qIdx], optIdx];
        }
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    // Calculate score and details
    let score = 0, correctAnswers = 0, incorrectAnswers = 0;
    const details = quiz.details.map((q, idx) => {
      const userAns = answers[idx] || [];
      const correctAns = q.correctAnswers || [];
      const isCorrect =
        q.type === 'single'
          ? userAns.length === 1 && userAns[0] === correctAns[0]
          : userAns.length > 0 &&
            userAns.every(a => correctAns.includes(a)) &&
            correctAns.every(a => userAns.includes(a));
      if (isCorrect) {
        score += 1;
        correctAnswers += 1;
      } else {
        incorrectAnswers += 1;
      }
      return {
        question: q.question,
        userAnswer: userAns.map(i => q.options[i]).join(', ') || 'Not answered',
        correctAnswer: correctAns.map(i => q.options[i]).join(', '),
        isCorrect,
        score: isCorrect ? 1 : 0,
        type: q.type
      };
    });
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers, score, correctAnswers, incorrectAnswers, details })
      });
      const data = await res.json();
      if (res.ok) {
        setSharedQuizResult({ score, correctAnswers, incorrectAnswers, details });
        setSharedQuizMeta({
          title: quiz.title,
          owner,
          createdAt
        });
        navigate('/result');
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('Failed to submit quiz.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin" size={32} /></div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full border border-blue-100">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">{quiz.title || 'Shared Quiz'}</h2>
        <div className="text-center text-gray-500 mb-4">
          {owner && <span>Created by <span className="font-semibold text-blue-600">{owner}</span></span>}
          {createdAt && <span className="ml-2">on {new Date(createdAt).toLocaleString()}</span>}
        </div>
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {quiz.details.map((q, qIdx) => (
            <div key={qIdx} className="mb-6">
              <p className="font-semibold mb-2">{qIdx + 1}. {q.question}</p>
              <div className="ml-4">
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-2 mb-1 cursor-pointer">
                    <input
                      type={q.type === 'single' ? 'radio' : 'checkbox'}
                      name={`q-${qIdx}`}
                      checked={answers[qIdx]?.includes(optIdx) || false}
                      onChange={() => handleOptionChange(qIdx, optIdx, q.type)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold text-lg"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TakeSharedQuiz; 