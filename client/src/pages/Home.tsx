import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { getQuizById, getDefaultQuiz } from "@/data/quizzes";
import { salvarPontuacao, buscarPlacar, pontuacaoParaPercentual } from "@/services/api";
import { Button } from "@/components/ui/button";
import { RankBadge } from "@/components/RankBadge";
import { Leaderboard } from "@/components/Leaderboard";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";
import { TopMenu } from "@/components/TopMenu";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { LoadingSkeleton, CardSkeleton } from "@/components/LoadingSkeleton";
import { QuizIntro, QuizProgress, QuizQuestion, QuizResult } from "@/components/quiz";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Volume2, VolumeX, Trophy, Share2, RotateCcw, Timer } from "lucide-react";

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
  tempo_segundos?: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Canvas Confetti
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
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 4 + 2,
        life: 1,
        color: ["#a855f7", "#06b6d4", "#f472b6", "#facc15", "#34d399"][Math.floor(Math.random() * 5)],
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      if (particles.some((p) => p.life > 0)) requestAnimationFrame(animate);
    };
    animate();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }} />;
};

// ==================== MAIN COMPONENT ====================

export default function Home() {
  const params = useParams<{ quizId?: string }>();
  const quizId = params.quizId || "gay";
  const currentQuiz = getQuizById(quizId) || getDefaultQuiz();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [superGayMode, setSuperGayMode] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCurrentQuestion(0);
    setTotalPoints(0);
    setShowResult(false);
    setQuizStarted(false);
    setQuestions([]);
    setShowConfetti(false);
    setShowLeaderboard(false);
    setShowNameInput(false);
    setStartTime(0);
    setSelectedAnswer(null);
    setShowIntro(true);
  }, [quizId]);

  useEffect(() => {
    clickSoundRef.current = new Audio('/sounds/guitar-click.mp3');
    successSoundRef.current = new Audio('/sounds/guitar-success.mp3');
    clickSoundRef.current.volume = 0.3;
    successSoundRef.current.volume = 0.5;
  }, []);

  const getResultByPercentage = (percentage: number): Result => {
    const category = percentage < 50 ? currentQuiz.categories.low : currentQuiz.categories.high;
    const titleObj = category.titles.find(t => percentage >= t.min && percentage <= t.max);
    if (titleObj) {
      return { percentage, title: titleObj.title, description: "", emoji: titleObj.emoji, badge: titleObj.title };
    }
    return { percentage, title: category.titles[0].title, description: "", emoji: category.titles[0].emoji, badge: category.titles[0].title };
  };

  // Easter egg
  useEffect(() => {
    let typed = "";
    const handleKeyPress = (e: KeyboardEvent) => {
      typed = (typed + e.key).slice(-3);
      if (typed.toLowerCase() === "gay") {
        setSuperGayMode(!superGayMode);
        if (!superGayMode) document.body.classList.add("super-gay-mode");
        else document.body.classList.remove("super-gay-mode");
        typed = "";
      }
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [superGayMode]);

  const loadLeaderboard = async () => {
    const placar = await buscarPlacar(100, currentQuiz.id);
    const entries: LeaderEntry[] = placar.map(score => ({
      name: score.apelido,
      percentage: pontuacaoParaPercentual(score.pontuacao, 15),
      result: getResultByPercentage(pontuacaoParaPercentual(score.pontuacao, 15)).title,
      date: new Date(score.data_registro).toLocaleDateString("pt-BR"),
      tempo_segundos: score.tempo_segundos,
    }));
    setLeaderboard(entries);
  };

  useEffect(() => { loadLeaderboard(); }, [quizId]);

  useEffect(() => {
    if (quizStarted) {
      const quizQuestions = currentQuiz.questions.map(q => ({
        id: q.id, text: q.pergunta,
        answers: q.opcoes.map(o => ({
          text: `${o.emoji ? `${o.emoji} ` : ""}${o.texto}`,
          points: o.pontos
        }))
      }));
      const shuffled = shuffleArray(quizQuestions).slice(0, 15);
      setQuestions(shuffled.map(q => ({ ...q, answers: shuffleArray(q.answers) })));
      setShowIntro(false);
    }
  }, [quizStarted, quizId]);

  const playSound = () => {
    if (!audioEnabled || !clickSoundRef.current) return;
    clickSoundRef.current.currentTime = 0;
    clickSoundRef.current.play().catch(() => {});
  };

  const playSuccessSound = () => {
    if (!audioEnabled || !successSoundRef.current) return;
    successSoundRef.current.currentTime = 0;
    successSoundRef.current.play().catch(() => {});
  };

  const handleAnswer = (points: number) => {
    if (selectedAnswer !== null) return;
    playSound();
    setSelectedAnswer(0); // Visual feedback
    setTimeout(() => {
      const newTotal = totalPoints + points;
      setTotalPoints(newTotal);
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        playSuccessSound();
        setShowConfetti(true);
        setShowNameInput(true);
      }
    }, 350);
  };

  const startQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/start?quiz_id=${encodeURIComponent(currentQuiz.id)}`);
      const data = await response.json();
      if (data.success && data.token) {
        sessionStorage.setItem('quiz_token', data.token);
        setQuizStarted(true);
        setStartTime(Date.now());
      } else {
        alert('Erro ao iniciar quiz. Tente novamente.');
      }
    } catch {
      alert('Erro ao conectar com o servidor.');
    }
  };

  const getResult = (): Result => {
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    return getResultByPercentage(percentage);
  };

  const saveToLeaderboard = async (name: string) => {
    const tempoSegundos = (Date.now() - startTime) / 1000;
    const apelido = name || "Anônimo";
    const saved = await salvarPontuacao(apelido, totalPoints, tempoSegundos, currentQuiz.id);
    if (saved) {
      await loadLeaderboard();
    } else {
      const result = getResult();
      const maxPoints = questions.length * 4;
      const percentage = Math.round((totalPoints / maxPoints) * 100);
      const entry: LeaderEntry = { name: apelido, percentage, result: result.title, date: new Date().toLocaleDateString("pt-BR") };
      const updated = [entry, ...leaderboard].slice(0, 50);
      setLeaderboard(updated);
      localStorage.setItem("gayQuizLeaderboard", JSON.stringify(updated));
    }
    setShowNameInput(false);
    setShowResult(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0); setTotalPoints(0); setShowResult(false);
    setQuizStarted(false); setQuestions([]); setShowConfetti(false);
    setPlayerName(""); setShowNameInput(false); setSelectedAnswer(null); setShowIntro(true);
  };

  const shareResult = (platform: string) => {
    const result = getResult();
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    const text = `Fiz o teste "${currentQuiz.title}" e meu resultado foi: ${result.title} (${percentage}%)! Quer tentar também?`;
    const url = window.location.href;
    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    if (shareUrls[platform]) window.open(shareUrls[platform], "_blank");
  };

  // ==================== RENDER: LEADERBOARD VIEW ====================
  if (showLeaderboard) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="relative z-10 pt-20 pb-32 px-4">
          <TopMenu />
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setShowLeaderboard(false)}
              className="mb-4 flex items-center gap-2 text-sm font-medium dark:text-gray-400 text-gray-500 hover:text-purple-500 transition-colors">
              ← Voltar
            </button>
            <Leaderboard leaderboard={leaderboard} maxItems={100} />
          </div>
        </div>
        <ChatWidget />
        <RadioPlayer />
      </div>
    );
  }

  // ==================== RENDER: NAME INPUT ====================
  if (showNameInput && !showResult) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {showConfetti && <CanvasConfetti />}
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 pt-20 pb-32">
          <TopMenu />
          <motion.div
            className="neon-card rounded-3xl p-8 max-w-md w-full text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl">🎉</div>
            <h2 className="orbitron text-2xl font-black dark:text-white text-gray-900">Quiz Completo!</h2>
            <p className="dark:text-gray-400 text-gray-500 text-sm">Quer aparecer no ranking?</p>
            <input type="text" placeholder="Seu nome (ou deixe em branco)" value={playerName}
              onChange={(e) => setPlayerName(e.target.value)} maxLength={20}
              className="w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 dark:border-purple-500/20 border-gray-200 border-2 focus:border-purple-500 focus:outline-none text-center text-sm" />
            <button onClick={() => saveToLeaderboard(playerName)}
              className="w-full py-3 rounded-xl text-white font-bold neon-btn">
              <Trophy className="w-5 h-5 mr-2" />
              Salvar no Ranking
            </button>
          </motion.div>
        </div>
        <ChatWidget />
        <RadioPlayer />
      </div>
    );
  }

  // ==================== RENDER: NOT STARTED ====================
  if (!quizStarted) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="relative z-10">
          <TopMenu />
          {!showIntro ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 pb-32">
              <QuizIntro onStart={startQuiz} title={currentQuiz.title} description={currentQuiz.description} quizId={currentQuiz.id} />
            </div>
          ) : (
            <div className="flex flex-col items-center p-4 pt-20 pb-32">
              <div className="w-full max-w-2xl">
                <div className="neon-card rounded-3xl p-8 md:p-10 text-center space-y-6 mb-8">
                  <div className="text-6xl">{currentQuiz.emoji}</div>
                  <h1 className="orbitron text-3xl md:text-4xl font-black dark:text-white text-gray-900">
                    {currentQuiz.title}
                  </h1>
                  <p className="dark:text-gray-400 text-gray-500 text-lg">{currentQuiz.description}</p>
                  <button onClick={startQuiz} className="w-full py-4 rounded-xl text-white font-bold text-lg neon-btn">
                    <Zap className="w-5 h-5 mr-2 inline" />
                    Começar Quiz
                  </button>
                  <button onClick={() => { setAudioEnabled(!audioEnabled); setShowIntro(false); }}
                    className="w-full py-3 rounded-xl text-sm font-medium dark:bg-white/5 bg-gray-50 dark:text-gray-400 text-gray-500 dark:hover:bg-white/10 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 dark:border border-purple-500/10 border-gray-200">
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    Som {audioEnabled ? "Ligado" : "Desligado"}
                  </button>
                </div>
                <Leaderboard leaderboard={leaderboard} maxItems={100} />
              </div>
            </div>
          )}
        </div>
        <ChatWidget />
        <RadioPlayer />
      </div>
    );
  }

  // ==================== RENDER: LOADING ====================
  if (questions.length === 0) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <WelcomeAnimation />
          <TopMenu />
          <CardSkeleton />
        </div>
        <ChatWidget />
        <RadioPlayer />
      </div>
    );
  }

  // ==================== RENDER: RESULT ====================
  if (showResult && questions.length > 0) {
    const result = getResult();
    const time = (Date.now() - startTime) / 1000;

    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
          {showConfetti && <CanvasConfetti />}
        </div>
        <div className="relative z-10 pt-20 pb-32">
          <TopMenu />
          <div className="flex flex-col items-center px-4 py-8">
            <QuizResult
              percentage={result.percentage}
              title={result.title}
              emoji={result.emoji}
              description={result.description}
              time={time}
              points={totalPoints}
              totalQuestions={questions.length}
              onRestart={resetQuiz}
              onLeaderboard={() => setShowLeaderboard(true)}
              onShare={() => shareResult("whatsapp")}
            />

            {/* Share buttons */}
            <div className="grid grid-cols-4 gap-2 mt-6 w-full max-w-lg">
              {[
                { platform: "twitter", icon: "𝕏", color: "dark:bg-gray-800 bg-gray-100 dark:text-white text-gray-900" },
                { platform: "whatsapp", icon: "💬", color: "dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-600" },
                { platform: "facebook", icon: "📘", color: "dark:bg-blue-500/10 bg-blue-50 dark:text-blue-400 text-blue-600" },
                { platform: "telegram", icon: "✈️", color: "dark:bg-sky-500/10 bg-sky-50 dark:text-sky-400 text-sky-600" },
              ].map(({ platform, icon, color }) => (
                <button key={platform} onClick={() => shareResult(platform)}
                  className={`py-3 rounded-xl font-bold text-sm ${color} dark:border border-purple-500/10 border-gray-200 transition-all hover:scale-105 active:scale-95`}>
                  {icon}
                </button>
              ))}
            </div>

            {/* Leaderboard below result */}
            <div className="w-full max-w-3xl mt-10">
              <Leaderboard leaderboard={leaderboard} maxItems={100} />
            </div>
          </div>
        </div>
        <ChatWidget />
        <RadioPlayer />
      </div>
    );
  }

  // ==================== RENDER: GAME (question loop) ====================
  const question = questions[currentQuestion];
  const maxPoints = questions.length * 4;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />
      <div className="relative z-10">
        <TopMenu />

        {/* Top HUD */}
        <div className="sticky top-0 z-50 dark:bg-[#06060e]/80 bg-white/80 backdrop-blur-xl dark:border-b border-purple-500/10 border-gray-100">
          <div className="max-w-xl mx-auto px-4 py-3">
            <QuizProgress current={currentQuestion} total={questions.length} points={totalPoints} maxPoints={maxPoints} />
          </div>
        </div>

        {/* Question Area */}
        <div className="flex items-start justify-center min-h-[calc(100vh-12rem)] p-4 pt-8 pb-32">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
              >
                {/* Question text */}
                <div className="text-center mb-8">
                  <h2 className="orbitron text-xl md:text-2xl font-black dark:text-white text-gray-900 leading-relaxed">
                    {question.text}
                  </h2>
                </div>

                {/* Answer options */}
                <div className="space-y-3">
                  {question.answers.map((answer, i) => {
                    const answerLabels = ["A", "B", "C", "D"];
                    const accentColors = [
                      "hover:border-purple-500/50 dark:hover:bg-purple-500/10 hover:bg-purple-50",
                      "hover:border-cyan-500/50 dark:hover:bg-cyan-500/10 hover:bg-cyan-50",
                      "hover:border-pink-500/50 dark:hover:bg-pink-500/10 hover:bg-pink-50",
                      "hover:border-amber-500/50 dark:hover:bg-amber-500/10 hover:bg-amber-50",
                    ];

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(answer.points)}
                        className={`w-full text-left p-4 md:p-5 rounded-xl transition-all duration-200 dark:bg-white/[0.03] bg-white dark:border border-white/[0.06] border-gray-200 ${accentColors[i]} disabled:cursor-default`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 dark:bg-white/5 bg-gray-100 dark:text-gray-500 text-gray-400">
                            {answerLabels[i]}
                          </span>
                          <span className="text-sm md:text-base font-medium dark:text-gray-200 text-gray-700 flex-1">
                            {answer.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Timer + question counter */}
                <div className="flex items-center justify-between mt-6 text-xs dark:text-gray-600 text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    {elapsed}s
                  </span>
                  <span>{currentQuestion + 1} / {questions.length}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <ChatWidget />
      <RadioPlayer />
    </div>
  );
}
