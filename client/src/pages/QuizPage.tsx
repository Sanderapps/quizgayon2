import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { getQuizById, getDefaultQuiz } from "@/data/quizzes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopMenu } from "@/components/TopMenu";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";
import type { Quiz, Question as QuizQuestion } from "@/data/quizzes/types";

// Função auxiliar para embaralhar array
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
  // Pegar quizId da URL (ex: /quiz/politico)
  const params = useParams<{ quizId: string }>();
  const [, setLocation] = useLocation();
  const quizId = params.quizId;
  
  // Carregar quiz baseado no ID
  const currentQuiz = getQuizById(quizId) || getDefaultQuiz();
  
  // Estados
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<ProcessedQuestion[]>([]);
  const [fadeOut, setFadeOut] = useState(false);

  // Embaralhar perguntas ao iniciar
  useEffect(() => {
    if (quizStarted && questions.length === 0) {
      // Converter perguntas do quiz para formato processado
      const quizQuestions: ProcessedQuestion[] = currentQuiz.questions.map(q => ({
        id: q.id,
        text: q.pergunta,
        emoji: q.emoji,
        answers: q.opcoes.map(o => ({ 
          text: `${o.emoji} ${o.texto}`, 
          points: o.pontos 
        }))
      }));
      
      // Embaralhar e pegar 15 perguntas
      const shuffled = shuffleArray(quizQuestions).slice(0, 15);
      
      // Embaralhar as respostas de cada pergunta
      const questionsWithShuffledAnswers = shuffled.map(q => ({
        ...q,
        answers: shuffleArray(q.answers)
      }));
      
      setQuestions(questionsWithShuffledAnswers);
    }
  }, [quizStarted, questions.length, currentQuiz]);

  // Função para obter título baseado na porcentagem
  const getTitleByPercentage = (percentage: number, isLow: boolean) => {
    const category = isLow ? currentQuiz.categories.low : currentQuiz.categories.high;
    
    // Buscar o título correspondente
    for (const titleObj of category.titles) {
      if (percentage >= titleObj.min && percentage <= titleObj.max) {
        return { title: titleObj.title, emoji: titleObj.emoji };
      }
    }
    
    // Fallback
    return { title: category.name, emoji: category.emoji };
  };

  // Função para obter frase baseada no score
  const getPhraseByScore = (score: number, isLow: boolean) => {
    const category = isLow ? currentQuiz.categories.low : currentQuiz.categories.high;
    const phrases = category.phrases;
    
    // Mapear score (1-20) para frase
    const phraseKey = Math.min(Math.max(1, Math.ceil(score / 5)), 20);
    return phrases[phraseKey] || "Continue assim!";
  };

  // Função para obter ícone baseado no score
  const getIconByScore = (score: number, isLow: boolean) => {
    const category = isLow ? currentQuiz.categories.low : currentQuiz.categories.high;
    const icons = category.icons;
    
    // Mapear score (1-20) para ícone
    const iconKey = Math.min(Math.max(1, Math.ceil(score / 5)), 20);
    return icons[iconKey] || category.emoji;
  };

  // Calcular resultado
  const getResult = () => {
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    const isLow = percentage < 50;
    
    const { title, emoji } = getTitleByPercentage(percentage, isLow);
    const phrase = getPhraseByScore(percentage, isLow);
    
    return {
      percentage,
      title,
      emoji,
      description: phrase
    };
  };

  // Handler de resposta
  const handleAnswer = (points: number) => {
    setFadeOut(true);
    
    setTimeout(() => {
      setTotalPoints(totalPoints + points);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setFadeOut(false);
      } else {
        setShowResult(true);
      }
    }, 300);
  };

  // Resetar quiz
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setTotalPoints(0);
    setShowResult(false);
    setQuizStarted(false);
    setQuestions([]);
    setFadeOut(false);
  };

  // Tela inicial
  if (!quizStarted) {
    return (
      <>
        <TopMenu />
        <div 
          className="min-h-screen flex flex-col items-center justify-center p-4"
          style={{ background: currentQuiz.theme.backgroundGradient }}
        >
          <Card className="w-full max-w-2xl p-8 text-center bg-white/90 backdrop-blur">
            <div className="text-6xl mb-6">{currentQuiz.emoji}</div>
            <h1 className="text-4xl font-bold mb-4">{currentQuiz.title}</h1>
            <p className="text-lg text-gray-600 mb-8">{currentQuiz.description}</p>
            
            <Button
              onClick={() => setQuizStarted(true)}
              className="w-full py-6 text-xl font-bold"
              style={{ 
                background: currentQuiz.theme.gradient,
                color: 'white'
              }}
            >
              Começar Quiz 🚀
            </Button>

            <div className="mt-6">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full"
              >
                ← Voltar ao Início
              </Button>
            </div>
          </Card>
        </div>
        
        <ChatWidget />
        <RadioPlayer />
      </>
    );
  }

  // Tela de resultado
  if (showResult && questions.length > 0) {
    const result = getResult();

    return (
      <>
        <TopMenu />
        <div 
          className="min-h-screen flex flex-col items-center p-4 pt-20"
          style={{ background: currentQuiz.theme.backgroundGradient }}
        >
          <div className="w-full max-w-2xl">
            {/* Resultado Principal */}
            <Card className="p-8 text-center mb-6 bg-white/90 backdrop-blur">
              <div className="text-6xl mb-4">{result.emoji}</div>
              <h1 className="text-4xl font-bold mb-3">{result.title}</h1>
              
              <div className="mb-6">
                <div className="text-6xl font-bold mb-3" style={{ color: currentQuiz.theme.primaryColor }}>
                  {result.percentage}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${result.percentage}%`,
                      background: currentQuiz.theme.gradient
                    }}
                  />
                </div>
              </div>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                {result.description}
              </p>
            </Card>

            {/* Botões de Ação */}
            <div className="space-y-4 mb-6">
              <Button
                onClick={resetQuiz}
                className="w-full py-4 text-lg font-bold"
                style={{ 
                  background: currentQuiz.theme.gradient,
                  color: 'white'
                }}
              >
                Tentar Novamente 🔄
              </Button>
              
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full py-4 text-lg font-bold"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
        
        <ChatWidget />
        <RadioPlayer />
      </>
    );
  }

  // Tela de perguntas
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <TopMenu />
      <div 
        className="min-h-screen flex flex-col items-center p-4 pt-20"
        style={{ background: currentQuiz.theme.backgroundGradient }}
      >
        <div className="w-full max-w-2xl">
          {/* Barra de Progresso */}
          <div className="mb-6">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  background: currentQuiz.theme.gradient
                }}
              />
            </div>
          </div>

          {/* Pergunta */}
          <Card className={`p-6 mb-6 bg-white/90 backdrop-blur transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-5xl mb-4 text-center">{question.emoji}</div>
            <h2 className="text-2xl font-bold text-center mb-6">{question.text}</h2>
            
            <div className="space-y-3">
              {question.answers.map((answer, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(answer.points)}
                  className="w-full py-4 text-lg font-semibold text-left justify-start hover:scale-105 transition-transform"
                  variant="outline"
                >
                  {answer.text}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      <ChatWidget />
      <RadioPlayer />
    </>
  );
}
