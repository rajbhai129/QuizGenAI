import { createContext, useState, useContext, useCallback } from "react";

// 1. Create context
const QuizContext = createContext();

// 2. Create provider component
export const QuizProvider = ({ children }) => {
  const [quizData, setQuizData] = useState(null); // Stores generated quiz
  const [userAnswers, setUserAnswers] = useState([]); // Stores user's selected answers
  const [quizHistory, setQuizHistory] = useState({ taken: [], created: [] });
  const [sharedQuizResult, setSharedQuizResult] = useState(null);
  const [sharedQuizMeta, setSharedQuizMeta] = useState(null);

  const fetchQuizHistory = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/quiz-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setQuizHistory(data);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    }
  }, []);

  const resetQuiz = () => {
    setQuizData(null);
    setUserAnswers([]);
  };

  return (
    <QuizContext.Provider
      value={{
        quizData,
        setQuizData,
        userAnswers,
        setUserAnswers,
        resetQuiz,
        quizHistory,
        fetchQuizHistory,
        sharedQuizResult,
        setSharedQuizResult,
        sharedQuizMeta,
        setSharedQuizMeta,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

// 3. Custom hook to use the context
export const useQuiz = () => useContext(QuizContext);
