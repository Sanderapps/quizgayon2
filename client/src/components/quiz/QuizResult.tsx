import { Button } from "@/components/ui/button";
import { ArenaSurface } from "@/components/layout/ArenaSurface";
import { Trophy, Share2, RotateCcw, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface QuizResultProps {
  percentage: number;
  title: string;
  emoji: string;
  description?: string;
  time: number;
  points: number;
  totalQuestions: number;
  onRestart: () => void;
  onLeaderboard: () => void;
  onShare?: () => void;
}

export function QuizResult({ percentage, title, emoji, time, points, totalQuestions, onRestart, onLeaderboard, onShare }: QuizResultProps) {
  const grade = percentage >= 80 ? 'S' : percentage >= 60 ? 'A' : percentage >= 40 ? 'B' : percentage >= 20 ? 'C' : 'D';
  const gradeColors: Record<string, string> = {
    S: 'from-amber-400 via-yellow-300 to-amber-500',
    A: 'from-purple-400 to-pink-500',
    B: 'from-cyan-400 to-blue-500',
    C: 'from-emerald-400 to-teal-500',
    D: 'from-gray-500 to-gray-600',
  };
  const stats = [
    { label: "Nível", value: `${percentage}%`, valueClassName: "neon-text" },
    { label: "Tempo", value: `${time.toFixed(0)}s`, valueClassName: "text-cyan-400" },
    { label: "Pontos", value: String(points), valueClassName: "text-amber-400" },
  ];

  return (
    <motion.div
      className="w-full max-w-lg mx-auto px-4 page-enter"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ArenaSurface variant="reading" className="space-y-6 rounded-3xl p-8 text-center md:p-10">
        <div className="relative inline-block">
          <div className={`orbitron bg-gradient-to-br text-7xl font-black text-transparent bg-clip-text md:text-8xl ${gradeColors[grade]}`}>
            {grade}
          </div>
          <div className="absolute -inset-4 blur-3xl opacity-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full" />
        </div>

        <div>
          <div className="mb-3 text-5xl">{emoji}</div>
          <h2 className="mb-2 text-xl font-black text-slate-50 md:text-2xl">
            {title}
          </h2>
          <p className="text-sm text-slate-300">
            {points}/{totalQuestions * 4} pontos • {time.toFixed(1)}s
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <ArenaSurface key={stat.label} variant="soft" className="rounded-xl p-3">
              <div className={`orbitron text-lg font-black ${stat.valueClassName}`}>{stat.value}</div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
            </ArenaSurface>
          ))}
        </div>

        <div className="space-y-3">
          <Button onClick={onLeaderboard} size="lg" className="neon-btn w-full rounded-xl py-5 font-bold">
            <Trophy className="w-5 h-5" />
            Ver Ranking
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onRestart} variant="outline" size="lg"
              className="rounded-xl border-white/10 bg-white/5 py-4 font-bold text-slate-200 transition-all hover:bg-white/10">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Jogar de Novo
            </Button>
            <Button onClick={onShare} variant="outline" size="lg"
              className="rounded-xl border-white/10 bg-white/5 py-4 font-bold text-slate-200 transition-all hover:bg-white/10">
              <Share2 className="w-4 h-4 mr-1.5" />
              Compartilhar
            </Button>
          </div>
        </div>
      </ArenaSurface>
    </motion.div>
  );
}
