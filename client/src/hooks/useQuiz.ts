import { useState, useCallback } from "react";

interface Question {
  id: number;
  text: string;
  answers: { text: string; points: number }[];
}

/**
 * Hook para gerenciar o estado do quiz
 */
export function useQuiz(questions: Question[]) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const startQuiz = useCallback(() => {
    setQuizStarted(true);
    setStartTime(Date.now());
  }, []);

  const answerQuestion = useCallback((points: number) => {
    setTotalPoints(prev => prev + points);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  }, [currentQuestion, questions.length]);

  const restartQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setTotalPoints(0);
    setShowResult(false);
    setQuizStarted(false);
    setStartTime(0);
  }, []);

  const getElapsedTime = useCallback(() => {
    if (startTime === 0) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }, [startTime]);

  const getPercentage = useCallback(() => {
    const maxPoints = questions.length * 4; // Assumindo 4 pontos máximos por pergunta
    return (totalPoints / maxPoints) * 100;
  }, [totalPoints, questions.length]);

  const getProgress = useCallback(() => {
    return ((currentQuestion + 1) / questions.length) * 100;
  }, [currentQuestion, questions.length]);

  return {
    currentQuestion,
    totalPoints,
    showResult,
    quizStarted,
    startQuiz,
    answerQuestion,
    restartQuiz,
    getElapsedTime,
    getPercentage,
    getProgress,
    currentQuestionData: questions[currentQuestion],
    totalQuestions: questions.length
  };
}
