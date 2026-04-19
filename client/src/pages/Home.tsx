import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { getQuizById, getDefaultQuiz } from "@/data/quizzes";
import { salvarPontuacao, buscarPlacar, pontuacaoParaPercentual } from "@/services/api";
import { Leaderboard } from "@/components/Leaderboard";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { ArenaPageShell } from "@/components/layout/ArenaPageShell";
import { ArenaSurface } from "@/components/layout/ArenaSurface";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { QuizIntro, QuizProgress, QuizQuestion, QuizResult } from "@/components/quiz";
import { QuizShareButtons } from "@/components/quiz/QuizShareButtons";
import { quizAudio } from "@/lib/quizAudio";
import { buildResultShareUrl, buildSavedScoreShareUrl, buildShareMessage, getResultDescription } from "@/lib/quizShare";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Volume2, VolumeX, Trophy } from "lucide-react";

const QUIZ_AUDIO_ENABLED_KEY = "quiz_audio_enabled";
const ANSWER_ADVANCE_DELAY_MS = 95;

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
  const [savedScoreId, setSavedScoreId] = useState<number | null>(null);
  const answerLockRef = useRef(false);

  useEffect(() => {
    const savedAudioPreference = localStorage.getItem(QUIZ_AUDIO_ENABLED_KEY);
    const nextEnabled = savedAudioPreference !== "false";
    setAudioEnabled(nextEnabled);
    quizAudio.setEnabled(nextEnabled);
  }, []);

  useEffect(() => {
    quizAudio.setEnabled(audioEnabled);
    localStorage.setItem(QUIZ_AUDIO_ENABLED_KEY, String(audioEnabled));
  }, [audioEnabled]);

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
    setSavedScoreId(null);
    answerLockRef.current = false;
  }, [quizId]);

  const getResultByPercentage = (percentage: number): Result => {
    const category = percentage < 50 ? currentQuiz.categories.low : currentQuiz.categories.high;
    const titleObj = category.titles.find(t => percentage >= t.min && percentage <= t.max);
    if (titleObj) {
      return {
        percentage,
        title: titleObj.title,
        description: getResultDescription(currentQuiz.id, percentage),
        emoji: titleObj.emoji,
        badge: titleObj.title,
      };
    }
    return {
      percentage,
      title: category.titles[0].title,
      description: getResultDescription(currentQuiz.id, percentage),
      emoji: category.titles[0].emoji,
      badge: category.titles[0].title,
    };
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
          text: o.texto,
          points: o.pontos
        }))
      }));
      const shuffled = shuffleArray(quizQuestions).slice(0, 15);
      setQuestions(shuffled.map(q => ({ ...q, answers: shuffleArray(q.answers) })));
      setShowIntro(false);
    }
  }, [quizStarted, quizId]);

  useEffect(() => {
    if (!quizStarted || questions.length === 0 || currentQuestion === 0 || showResult) return;
    quizAudio.playTransition();
  }, [currentQuestion, quizStarted, questions.length, showResult]);

  const playSound = () => quizAudio.playAnswer();
  const playSuccessSound = () => quizAudio.playSuccess();

  const handleAnswer = (points: number, answerIndex: number) => {
    if (answerLockRef.current || selectedAnswer !== null) return;
    answerLockRef.current = true;
    playSound();
    setSelectedAnswer(answerIndex);
    window.setTimeout(() => {
      const newTotal = totalPoints + points;
      setTotalPoints(newTotal);
      setSelectedAnswer(null);
      if (currentQuestion < questions.length - 1) {
        quizAudio.playConfirm();
        setCurrentQuestion(currentQuestion + 1);
      } else {
        playSuccessSound();
        setShowConfetti(true);
        setShowNameInput(true);
      }
      answerLockRef.current = false;
    }, ANSWER_ADVANCE_DELAY_MS);
  };

  const startQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/start?quiz_id=${encodeURIComponent(currentQuiz.id)}`);
      const data = await response.json();
      if (data.success && data.token) {
        sessionStorage.setItem('quiz_token', data.token);
        quizAudio.playStart();
        setQuizStarted(true);
        setStartTime(Date.now());
      } else {
        alert('Não deu para abrir o quiz agora. Tenta mais uma vez em instantes.');
      }
    } catch {
      alert('Sem resposta do servidor no momento.');
    }
  };

  const getResult = (): Result => {
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    return getResultByPercentage(percentage);
  };

  const saveToLeaderboard = async (name: string) => {
    quizAudio.playConfirm();
    const tempoSegundos = (Date.now() - startTime) / 1000;
    const apelido = name || "Anônimo";
    const saved = await salvarPontuacao(apelido, totalPoints, tempoSegundos, currentQuiz.id);
    if (saved) {
      setSavedScoreId(saved.id || null);
      await loadLeaderboard();
    } else {
      const result = getResult();
      const maxPoints = questions.length * 4;
      const percentage = Math.round((totalPoints / maxPoints) * 100);
      const entry: LeaderEntry = { name: apelido, percentage, result: result.title, date: new Date().toLocaleDateString("pt-BR") };
      const updated = [entry, ...leaderboard].slice(0, 50);
      setLeaderboard(updated);
      localStorage.setItem("gayQuizLeaderboard", JSON.stringify(updated));
      setSavedScoreId(null);
    }
    setShowNameInput(false);
    setShowResult(true);
  };

  const handleMenuNavigation = (page: string) => {
    if (page === "leaderboard") {
      setShowLeaderboard(true);
      return;
    }

    if (page === "quiz") {
      resetQuiz();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0); setTotalPoints(0); setShowResult(false);
    setQuizStarted(false); setQuestions([]); setShowConfetti(false);
    setPlayerName(""); setShowNameInput(false); setSelectedAnswer(null); setShowIntro(true);
  };

  const shareResult = (platform: "twitter" | "facebook" | "telegram" | "whatsapp") => {
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    const elapsedTime = (Date.now() - startTime) / 1000;
    const url = savedScoreId
      ? buildSavedScoreShareUrl(window.location.origin, savedScoreId)
      : buildResultShareUrl(window.location.origin, currentQuiz.id, percentage, totalPoints, elapsedTime);
    const text = buildShareMessage(currentQuiz.id, percentage);
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    quizAudio.playShare();
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
  };

  // ==================== RENDER: LEADERBOARD VIEW ====================
  if (showLeaderboard) {
    return (
      <ArenaPageShell onNavigate={handleMenuNavigation} shellClassName="px-4 pb-32 pt-20">
          <div className="mx-auto max-w-3xl">
            <button onClick={() => setShowLeaderboard(false)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-purple-300">
              ← Voltar
            </button>
            <ArenaSurface variant="panel" className="rounded-[28px] p-4 sm:p-6">
              <Leaderboard leaderboard={leaderboard} maxItems={100} />
            </ArenaSurface>
          </div>
      </ArenaPageShell>
    );
  }

  // ==================== RENDER: NAME INPUT ====================
  if (showNameInput && !showResult) {
    return (
      <ArenaPageShell
        onNavigate={handleMenuNavigation}
        overlay={showConfetti ? <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}><CanvasConfetti /></div> : null}
        shellClassName="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4 pb-32 pt-20"
      >
          <motion.div
            className="w-full max-w-md space-y-6 rounded-[28px] p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ArenaSurface variant="reading" className="space-y-6 rounded-[28px] p-8 text-center">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">Fim de rodada</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Quer colocar esse resultado no placar?</p>
              <input type="text" placeholder="Seu nome (ou deixe em branco)" value={playerName}
                onChange={(e) => setPlayerName(e.target.value)} maxLength={20}
                className="w-full rounded-xl border border-slate-200/80 bg-white/85 px-4 py-3 text-center text-sm text-slate-900 outline-none transition-colors focus:border-fuchsia-400/60 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-purple-400/50" />
              <button onClick={() => saveToLeaderboard(playerName)}
                className="neon-btn neon-btn-strong w-full rounded-xl py-3 font-bold text-white">
                <Trophy className="w-5 h-5 mr-2" />
                Salvar no placar
              </button>
            </ArenaSurface>
          </motion.div>
      </ArenaPageShell>
    );
  }

  // ==================== RENDER: NOT STARTED ====================
  if (!quizStarted) {
    return (
      <ArenaPageShell onNavigate={handleMenuNavigation}>
          {!showIntro ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 pb-32">
              <QuizIntro onStart={startQuiz} title={currentQuiz.title} description={currentQuiz.description} quizId={currentQuiz.id} />
            </div>
          ) : (
            <div className="flex flex-col items-center p-4 pb-32 pt-20">
              <div className="w-full max-w-3xl">
                <ArenaSurface variant="reading" className="mb-8 rounded-[30px] p-8 text-center md:p-10">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Quiz escolhido</div>
                  <div className="text-6xl">{currentQuiz.emoji}</div>
                  <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-slate-50 md:text-4xl">
                    {currentQuiz.title}
                  </h1>
                  <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{currentQuiz.description}</p>
                  <div className="mt-8 space-y-3">
                    <button onClick={startQuiz} className="neon-btn neon-btn-strong w-full rounded-xl py-4 text-lg font-bold text-white">
                      <Zap className="w-5 h-5 mr-2 inline" />
                      Começar quiz
                    </button>
                    <button onClick={() => { setAudioEnabled(!audioEnabled); setShowIntro(false); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12">
                      {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      Efeitos {audioEnabled ? "ligados" : "desligados"}
                    </button>
                  </div>
                </ArenaSurface>
                <ArenaSurface variant="panel" className="rounded-[28px] p-4 sm:p-6">
                  <Leaderboard leaderboard={leaderboard} maxItems={100} />
                </ArenaSurface>
              </div>
            </div>
          )}
      </ArenaPageShell>
    );
  }

  // ==================== RENDER: LOADING ====================
  if (questions.length === 0) {
    return (
      <ArenaPageShell shellClassName="flex min-h-screen items-center justify-center p-4" onNavigate={handleMenuNavigation}>
          <WelcomeAnimation />
          <CardSkeleton />
      </ArenaPageShell>
    );
  }

  // ==================== RENDER: RESULT ====================
  if (showResult && questions.length > 0) {
    const result = getResult();
    const time = (Date.now() - startTime) / 1000;

    return (
      <ArenaPageShell
        onNavigate={handleMenuNavigation}
        overlay={showConfetti ? <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}><CanvasConfetti /></div> : null}
        shellClassName="pb-32 pt-20"
      >
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

            <QuizShareButtons onShare={shareResult} className="mt-6" />

            <div className="w-full max-w-3xl mt-10">
              <ArenaSurface variant="panel" className="rounded-[28px] p-4 sm:p-6">
                <Leaderboard leaderboard={leaderboard} maxItems={100} />
              </ArenaSurface>
            </div>
          </div>
      </ArenaPageShell>
    );
  }

  // ==================== RENDER: GAME (question loop) ====================
  const question = questions[currentQuestion];
  const maxPoints = questions.length * 4;

  return (
    <ArenaPageShell onNavigate={handleMenuNavigation}>
        <div className="sticky top-0 z-50 border-b border-white/8 bg-[#070b14]/88 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <QuizProgress current={currentQuestion} total={questions.length} points={totalPoints} maxPoints={maxPoints} />
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-12rem)] items-start justify-center p-4 pb-32 pt-8">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <QuizQuestion
                  question={question}
                  questionIndex={currentQuestion}
                  totalQuestions={questions.length}
                  onAnswer={handleAnswer}
                  selectedAnswer={selectedAnswer}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
    </ArenaPageShell>
  );
}
