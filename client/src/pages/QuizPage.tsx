import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { getQuizById, getDefaultQuiz } from "@/data/quizzes";
import { Button } from "@/components/ui/button";
import { TopMenu } from "@/components/TopMenu";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";
import type { Quiz } from "@/data/quizzes/types";
import { motion } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface ProcessedQuestion {
  id: number;
  text: string;
  emoji: string;
  answers: { text: string; points: number }[];
}

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();
  const [, setLocation] = useLocation();
  const quizId = params.quizId;
  const currentQuiz = getQuizById(quizId);

  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="relative z-10 flex items-center justify-center p-4">
          <div className="neon-card rounded-2xl p-8 text-center max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="orbitron text-2xl font-black dark:text-white text-gray-900 mb-3">Quiz não encontrado</h1>
            <p className="dark:text-gray-400 text-gray-500 text-sm mb-6">O quiz "{quizId}" não existe ou está sem perguntas.</p>
            <Button onClick={() => setLocation("/")} className="w-full neon-btn">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<ProcessedQuestion[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (quizStarted) {
      const processed = currentQuiz.questions.map((q: any) => ({
        id: q.id,
        text: q.pergunta,
        emoji: q.emoji || "❓",
        answers: q.opcoes.map((o: any) => ({ text: `${o.emoji} ${o.texto}`, points: o.pontos })),
      }));
      setQuestions(shuffleArray(processed).slice(0, 15).map(q => ({ ...q, answers: shuffleArray(q.answers) })));
    }
  }, [quizStarted]);

  const handleAnswer = (points: number) => {
    const newTotal = totalPoints + points;
    setTotalPoints(newTotal);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const startQuiz = async () => {
    try {
      const response = await fetch('/api/quiz/start');
      const data = await response.json();
      if (data.success && data.token) {
        sessionStorage.setItem('quiz_token', data.token);
        setQuizStarted(true);
        setStartTime(Date.now());
      }
    } catch {
      alert('Erro ao conectar com o servidor.');
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setTotalPoints(0);
    setShowResult(false);
    setQuizStarted(false);
    setQuestions([]);
  };

  const getResult = () => {
    const maxPoints = questions.length * 4;
    const pct = Math.round((totalPoints / maxPoints) * 100);
    const category = pct < 50 ? currentQuiz.categories.low : currentQuiz.categories.high;
    const titleObj = category.titles.find((t: any) => pct >= t.min && pct <= t.max);
    return { percentage: pct, title: titleObj?.title || category.titles[0]?.title, emoji: titleObj?.emoji || category.titles[0]?.emoji };
  };

  if (!quizStarted) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="relative z-10">
          <TopMenu />
          <ChatWidget />
          <RadioPlayer />
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
            <motion.div
              className="neon-card rounded-3xl p-8 md:p-10 max-w-lg w-full text-center space-y-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                  style={{ background: currentQuiz.theme?.gradient || "linear-gradient(135deg, #a855f7, #06b6d4)" }} />
                <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-5xl"
                  style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                  {currentQuiz.emoji}
                </div>
              </div>
              <h1 className="orbitron text-2xl md:text-3xl font-black dark:text-white text-gray-900">
                {currentQuiz.title}
              </h1>
              <p className="dark:text-gray-400 text-gray-500 text-sm">{currentQuiz.description}</p>
              <Button onClick={startQuiz} size="lg" className="w-full py-6 text-lg neon-btn">
                <Zap className="w-5 h-5 mr-2" />
                Entrar na Arena
              </Button>
              <p className="text-[10px] dark:text-gray-600 text-gray-400">15 perguntas • ~2 minutos • 100% anônimo</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const result = getResult();
    const time = ((Date.now() - startTime) / 1000).toFixed(1);

    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="relative z-10">
          <TopMenu />
          <ChatWidget />
          <RadioPlayer />
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
            <motion.div
              className="neon-card rounded-3xl p-8 md:p-10 max-w-lg w-full text-center space-y-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-6xl">{result.emoji}</div>
              <h2 className="orbitron text-3xl font-black dark:text-white text-gray-900">{result.title}</h2>
              <div className="orbitron text-5xl font-black neon-text">{result.percentage}%</div>
              <p className="dark:text-gray-400 text-gray-500 text-sm">{totalPoints} pontos • {time}s</p>
              <Button onClick={restartQuiz} className="w-full neon-btn">
                Jogar Novamente
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const pct = Math.round((totalPoints / (questions.length * 4)) * 100);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
      <div className="relative z-10">
        <TopMenu />
        <ChatWidget />
        <RadioPlayer />

        {/* HUD */}
        <div className="sticky top-0 z-50 dark:bg-[#06060e]/80 bg-white/80 backdrop-blur-xl dark:border-b border-purple-500/10 border-gray-100">
          <div className="max-w-xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold dark:text-gray-400 text-gray-500">
                {currentQuestion + 1} / {questions.length}
              </span>
              <span className="orbitron text-sm font-black neon-text">{pct}%</span>
            </div>
            <div className="progress-neon">
              <div className="progress-neon-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex items-start justify-center min-h-[calc(100vh-12rem)] p-4 pt-8 pb-32">
          <div className="w-full max-w-xl">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
              className="text-center mb-6"
            >
              {question.emoji && <span className="text-4xl mb-3 inline-block">{question.emoji}</span>}
              <h2 className="orbitron text-xl md:text-2xl font-black dark:text-white text-gray-900 leading-relaxed">
                {question.text}
              </h2>
            </motion.div>

            <div className="space-y-3">
              {question.answers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(answer.points)}
                  className={`w-full text-left p-4 md:p-5 rounded-xl transition-all duration-200 dark:bg-white/[0.03] bg-white dark:border border-white/[0.06] border-gray-200 hover:border-purple-500/50 dark:hover:bg-purple-500/10 hover:bg-purple-50`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 dark:bg-white/5 bg-gray-100 dark:text-gray-500 text-gray-400">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm md:text-base font-medium dark:text-gray-200 text-gray-700 flex-1">
                      {answer.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
