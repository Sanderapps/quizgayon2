import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { getQuizById, getDefaultQuiz } from "@/data/quizzes";
import { salvarPontuacao, buscarPlacar, pontuacaoParaPercentual } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RankBadge } from "@/components/RankBadge";
import { Leaderboard } from "@/components/Leaderboard";

import { ChatWidget } from "@/components/ChatWidget";

import { RadioPlayer } from "@/components/RadioPlayer";
import { TopMenu } from "@/components/TopMenu";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { LoadingSkeleton, CardSkeleton } from "@/components/LoadingSkeleton";


interface Question {
  id: number;
  text: string;
  answers: { text: string; points: number }[];
  nsfw?: boolean;
}

interface Result {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  badge?: string;
}

interface LeaderEntry {
  name: string;
  percentage: number;
  result: string;
  date: string;
  // Adicionar campos do banco de dados para melhor tipagem, se necessário
  tempo_segundos?: number;
}

// QUESTIONS_POOL e RESULTS foram removidos - agora usamos currentQuiz.questions e currentQuiz.categories



// Função para embaralhar array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Componente de confete melhorado
const CanvasConfetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        life: 1,
        color: ["#ff006e", "#8338ec", "#3a86ff", "#fb5607", "#ffbe0b"][
          Math.floor(Math.random() * 5)
        ],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (particles.some((p) => p.life > 0)) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
    />
  );
};

// Componente de emojis animados
const AnimatedEmoji = ({ emoji }: { emoji: string }) => {
  return (
    <span className="inline-block animate-bounce" style={{
      animation: "bounce 0.6s infinite, pulse 0.8s infinite"
    }}>
      {emoji}
    </span>
  );
};

export default function Home() {
  // Pegar quizId da URL (ex: /quiz/politico)
  const params = useParams<{ quizId?: string }>();
  const quizId = params.quizId || "gay"; // Default: quiz gay
  
  // Carregar quiz baseado no ID
  const currentQuiz = getQuizById(quizId) || getDefaultQuiz();
  
  // Log para debug
  console.log("Quiz atual:", currentQuiz.id, currentQuiz.title);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [superGayMode, setSuperGayMode] = useState(false);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [startTime, setStartTime] = useState<number>(0); // NOVO: Rastrear tempo de início



  // Referências de áudio para SFX de guitarra (reutilizáveis)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Resetar estado quando mudar de quiz
  useEffect(() => {
    setCurrentQuestion(0);
    setTotalPoints(0);
    setShowResult(false);
    setQuizStarted(false);
    setQuestions([]);
    setShowConfetti(false);
    setFadeOut(false);
    setShowLeaderboard(false);
    setShowNameInput(false);
    setStartTime(0);
  }, [quizId]);

  // Inicializar os áudios de guitarra uma vez
  useEffect(() => {
    clickSoundRef.current = new Audio('/sounds/guitar-click.mp3');
    successSoundRef.current = new Audio('/sounds/guitar-success.mp3');
    clickSoundRef.current.volume = 0.3;
    successSoundRef.current.volume = 0.5;
  }, []);

  // Função auxiliar para obter o resultado baseado na porcentagem
  const getResultByPercentage = (percentage: number): Result => {
    const category = percentage < 50 ? currentQuiz.categories.low : currentQuiz.categories.high;
    
    // Encontrar o título correspondente à porcentagem
    const titleObj = category.titles.find(t => percentage >= t.min && percentage <= t.max);
    
    if (titleObj) {
      return {
        percentage,
        title: titleObj.title,
        description: "", // Descrição não é mais usada
        emoji: titleObj.emoji,
        badge: titleObj.title
      };
    }
    
    // Fallback: retornar o primeiro título
    return {
      percentage,
      title: category.titles[0].title,
      description: "",
      emoji: category.titles[0].emoji,
      badge: category.titles[0].title
    };
  };

  // EASTER EGG: Modo Super Gay
  useEffect(() => {
    let typed = "";
    
    const handleKeyPress = (e: KeyboardEvent) => {
      typed = (typed + e.key).slice(-3);
      
      if (typed.toLowerCase() === "gay") {
        setSuperGayMode(!superGayMode);
        
        if (!superGayMode) {
          document.body.classList.add("super-gay-mode");
          alert("🌈 MODO SUPER GAY ATIVADO! 🌈\n\nDigite 'gay' novamente para desativar.");
        } else {
          document.body.classList.remove("super-gay-mode");
        }
        
        typed = "";
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [superGayMode]);

  // Função para carregar o placar do banco de dados
  const loadLeaderboard = async () => {
    const placar = await buscarPlacar(100, currentQuiz.id); // Top 100 do quiz atual
    
    // Converter formato do banco para formato do frontend
    const entries: LeaderEntry[] = placar.map(score => {
      // Usar 15 como total de perguntas padrão para cálculo de porcentagem, 
      // pois o número real de perguntas pode variar
      const percentage = pontuacaoParaPercentual(score.pontuacao, 15); 
      return {
        name: score.apelido,
        percentage,
        result: getResultByPercentage(percentage).title,
        date: new Date(score.data_registro).toLocaleDateString("pt-BR"),
        tempo_segundos: score.tempo_segundos,
      };
    });
    
    setLeaderboard(entries);
  };

  // Carregar leaderboard ao montar o componente
  useEffect(() => {
    loadLeaderboard();
  }, [quizId]); // Recarregar leaderboard quando mudar de quiz

  // Embaralhar perguntas ao iniciar ou ao mudar de quiz
  useEffect(() => {
    if (quizStarted) {
      // Usar perguntas do quiz atual (gay ou político)
      const quizQuestions = currentQuiz.questions.map(q => ({
        id: q.id,
        text: q.pergunta,
        answers: q.opcoes.map(o => ({ text: `${o.emoji} ${o.texto}`, points: o.pontos }))
      }));
      const shuffled = shuffleArray(quizQuestions).slice(0, 15);
      // Embaralhar as respostas de cada pergunta
      const questionsWithShuffledAnswers = shuffled.map(q => ({
        ...q,
        answers: shuffleArray(q.answers)
      }));
      setQuestions(questionsWithShuffledAnswers);
    }
  }, [quizStarted, quizId]); // Reembaralhar quando mudar de quiz

  // Função para tocar som de clique/resposta (power chord de guitarra)
  const playSound = () => {
    if (!audioEnabled || !clickSoundRef.current) return;
    clickSoundRef.current.currentTime = 0; // Reset para permitir cliques rápidos
    clickSoundRef.current.play().catch(() => {}); // Catch para evitar erros de autoplay
  };

  // Função para tocar som de sucesso (riff de guitarra)
  const playSuccessSound = () => {
    if (!audioEnabled || !successSoundRef.current) return;
    successSoundRef.current.currentTime = 0;
    successSoundRef.current.play().catch(() => {});
  };



  const handleAnswer = (points: number) => {
    playSound();
    setFadeOut(true);

    setTimeout(() => {
      const newTotal = totalPoints + points;
      setTotalPoints(newTotal);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setFadeOut(false);
      } else {
        playSuccessSound(); // NOVO: Toca som de sucesso
        setShowConfetti(true);
        setShowNameInput(true);
      }
    }, 300);
  };

  const startQuiz = async () => {
    try {
      // Solicitar token de sessão ao backend
      const response = await fetch('/api/quiz/start');
      const data = await response.json();
      
      if (data.success && data.token) {
        // Armazenar token no sessionStorage
        sessionStorage.setItem('quiz_token', data.token);
        setQuizStarted(true);
        setStartTime(Date.now());
      } else {
        alert('Erro ao iniciar quiz. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao obter token:', error);
      alert('Erro ao conectar com o servidor. Tente novamente.');
    }
  };

  const getResult = (): Result => {
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    return getResultByPercentage(percentage);
  };

  const saveToLeaderboard = async (name: string) => {
    const tempoSegundos = (Date.now() - startTime) / 1000; // Calcula tempo em segundos
    const apelido = name || "Anônimo";

    // Salvar no banco de dados PostgreSQL
    const saved = await salvarPontuacao(apelido, totalPoints, tempoSegundos, currentQuiz.id);

    if (saved) {
      console.log("✅ Pontuação salva no banco de dados:", saved);
      
      // Atualizar placar local
      await loadLeaderboard();
    } else {
      console.error("❌ Erro ao salvar pontuação");
      // Fallback: manter lógica antiga de localStorage (opcional, mas bom para robustez)
      const result = getResult();
      const maxPoints = questions.length * 4;
      const percentage = Math.round((totalPoints / maxPoints) * 100);
      
      const entry: LeaderEntry = {
        name: apelido,
        percentage,
        result: result.title,
        date: new Date().toLocaleDateString("pt-BR"),
      };
      
      const updated = [entry, ...leaderboard].slice(0, 50);
      setLeaderboard(updated);
      localStorage.setItem("gayQuizLeaderboard", JSON.stringify(updated));
    }

    setShowNameInput(false);
    setShowResult(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setTotalPoints(0);
    setShowResult(false);
    setQuizStarted(false);
    setQuestions([]);
    setShowConfetti(false);
    setFadeOut(false);
    setPlayerName("");
    setShowNameInput(false);
  };

  const shareResult = (platform: string) => {
    const result = getResult();
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    const text = `Fiz o teste "Descubra se você é gay" e meu resultado foi: ${result.title} (${percentage}%)! 🌈 Quer tentar também?`;
    const url = window.location.href;

    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
  };

  if (showLeaderboard) {
    return (
      <>
      <TopMenu />
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center p-4 pt-20 pb-40">
        <Card className="w-full max-w-2xl p-8 pb-32 bg-white dark:bg-gray-800 shadow-2xl max-h-96 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            🏆 Placar de Líderes 🏆
          </h1>
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Nenhum resultado ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                  <div>
	                    <p className="font-bold text-gray-800 dark:text-white">#{index + 1} {entry.name}</p>
	                    <p className="text-sm text-gray-600 dark:text-gray-300">{entry.result} ({entry.percentage}%)</p>
	                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.date} {entry.tempo_segundos ? `(${entry.tempo_segundos.toFixed(2)}s)` : ""}</p>
                  </div>
                  <p className="text-2xl">{entry.percentage >= 85 ? "👑" : entry.percentage >= 65 ? "🌟" : "💜"}</p>
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={() => setShowLeaderboard(false)}
            className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2"
          >
            Voltar
          </Button>
        </Card>
      </div>
      <ChatWidget />

      <RadioPlayer />

      </>
    );
  }

  if (showNameInput && !showResult) {
    return (
      <>
        <TopMenu />
  
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex items-center justify-center p-4 pt-20 pb-40">
        <Card className="w-full max-w-md p-8 text-center bg-white dark:bg-gray-800 shadow-2xl">
          <div className="text-6xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Parabéns!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Quer aparecer no placar de líderes?</p>
          <input
            type="text"
            placeholder="Seu nome (ou deixe em branco para anônimo)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 border-2 border-purple-300 rounded-lg mb-4 focus:outline-none focus:border-purple-600"
            maxLength={20}
          />
          <Button
            onClick={() => saveToLeaderboard(playerName)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2"
          >
            Salvar no Placar 🏆
          </Button>
        </Card>
      </div>
      <ChatWidget />

      <RadioPlayer />

      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <TopMenu />
  
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center p-4 pt-20 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <Card className="w-full p-8 text-center bg-white dark:bg-gray-800 shadow-2xl mb-8">
            <div className="text-6xl mb-6">
              <AnimatedEmoji emoji={currentQuiz.emoji} />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              {currentQuiz.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              {currentQuiz.description}
            </p>
	            <Button
	              onClick={startQuiz}
	              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 text-lg mb-3"
	            >
	              Começar Quiz! 🚀
	            </Button>

            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              title={audioEnabled ? "Som Ativado" : "Som Desativado"}
            >
              <span className="text-2xl">{audioEnabled ? "🔊" : "🔇"}</span>
            </Button>
          </Card>

          {/* Placar de Líderes na tela inicial */}
          <Leaderboard leaderboard={leaderboard} maxItems={12} />
        </div>
      </div>
      <ChatWidget />

      <RadioPlayer />


      </>
    );
  }

  if (showResult && questions.length > 0) {
    const result = getResult();
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    return (
      <>
        <TopMenu />
  
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center p-4 pt-20 py-8 overflow-y-auto">
        {showConfetti && <CanvasConfetti />}
        
        <div className="w-full max-w-2xl">
          {/* Resultado Principal */}
          <div className="text-center mb-12">
            <div className="text-5xl mb-4 animate-bounce">{result.emoji}</div>
            <h1 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">
              {result.title}
            </h1>
            {result.badge && (
              <div className="mb-4 inline-block bg-white dark:bg-gray-700 px-5 py-2 rounded-full font-bold text-purple-600 dark:text-purple-300 shadow-lg text-sm">
                {result.badge}
              </div>
            )}
            <div className="mb-6">
              <div className="text-6xl font-bold text-white drop-shadow-lg mb-3">
                {percentage}%
              </div>
              <div className="w-full bg-white dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-lg">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <p className="text-white text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed drop-shadow-2xl max-w-3xl mx-auto px-4 py-6 whitespace-normal break-words bg-black/30 rounded-lg border-2 border-white/20">
              {result.description}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="max-w-md mx-auto mb-12 space-y-4">
            <Button
              onClick={resetQuiz}
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-purple-600 dark:text-purple-300 font-bold py-3 text-lg shadow-lg"
            >
              Tentar Novamente 🔄
            </Button>
          </div>

          {/* Placar de Líderes */}
          <Leaderboard leaderboard={leaderboard} maxItems={12} />

          {/* Botões de Compartilhamento */}
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-md mx-auto">
            <Button
              onClick={() => shareResult("twitter")}
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 text-lg shadow-lg"
            >
              𝕏
            </Button>
            <Button
              onClick={() => shareResult("whatsapp")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg shadow-lg"
            >
              WhatsApp
            </Button>
            <Button
              onClick={() => shareResult("facebook")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg shadow-lg"
            >
              Facebook
            </Button>
            <Button
              onClick={() => shareResult("telegram")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 text-lg shadow-lg"
            >
              Telegram
            </Button>
          </div>
        </div>
      </div>
      <ChatWidget />

      <RadioPlayer />


      </>
    );
  }

  if (questions.length === 0) {
    return (
    <>
      <WelcomeAnimation />
      <TopMenu />

      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex items-center justify-center p-4 pt-20 pb-40">
        <CardSkeleton />
      </div>
      <ChatWidget />

      <RadioPlayer />
    </>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <TopMenu />

      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center justify-center p-4 pt-20 pb-40">
        <Card
          className={`w-full max-w-2xl p-8 bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 ${
            fadeOut ? "opacity-50 scale-95" : "opacity-100 scale-100"
          }`}
        >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-base md:text-lg font-bold text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white text-center animate-in fade-in">
          <AnimatedEmoji emoji={["🤔", "💭", "❓"][currentQuestion % 3]} /> {question.text}
        </h2>

        {/* Answers */}
        <div className="space-y-4">
          {question.answers.map((answer, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(answer.points)}
              className="w-full p-6 h-auto text-left text-lg font-semibold bg-gradient-to-r from-pink-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 hover:from-pink-300 hover:to-purple-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-800 dark:text-white border-2 border-purple-300 dark:border-purple-500 hover:border-purple-500 transition-all duration-200 transform hover:scale-105 active:scale-95 whitespace-normal"
            >
              {answer.text}
            </Button>
          ))}
        </div>

        {/* Skip info */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
          Pergunta {currentQuestion + 1}/{questions.length}
        </p>
        </Card>
      </div>
      <ChatWidget />

      <RadioPlayer />
    </>
  );
}
