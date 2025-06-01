import { createContext, useState, useContext } from "react";

// 1. Create context
const QuizContext = createContext();

// 2. Create provider component
export const QuizProvider = ({ children }) => {
  const [quizData, setQuizData] = useState(null); // Stores generated quiz
  const [userAnswers, setUserAnswers] = useState([]); // Stores user's selected answers

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
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

// 3. Custom hook to use the context
export const useQuiz = () => useContext(QuizContext);
