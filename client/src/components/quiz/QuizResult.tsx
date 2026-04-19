import { Button } from "@/components/ui/button";
import { ArenaSurface } from "@/components/layout/ArenaSurface";
import { Trophy, Share2, RotateCcw, Sparkles, ArrowRight, BadgeCheck, TimerReset } from "lucide-react";
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

export function QuizResult({ percentage, title, emoji, description, time, points, totalQuestions, onRestart, onLeaderboard, onShare }: QuizResultProps) {
  const grade = percentage >= 80 ? 'S' : percentage >= 60 ? 'A' : percentage >= 40 ? 'B' : percentage >= 20 ? 'C' : 'D';
  const gradeColors: Record<string, string> = {
    S: 'from-amber-400 via-yellow-300 to-amber-500',
    A: 'from-purple-400 to-pink-500',
    B: 'from-cyan-400 to-blue-500',
    C: 'from-emerald-400 to-teal-500',
    D: 'from-gray-500 to-gray-600',
  };
  const stats = [
    { label: "Faixa", value: `${percentage}%`, valueClassName: "neon-text", icon: BadgeCheck },
    { label: "Tempo", value: `${time.toFixed(0)}s`, valueClassName: "text-cyan-400", icon: TimerReset },
    { label: "Pontos", value: String(points), valueClassName: "text-amber-400", icon: Trophy },
  ];

  return (
    <motion.div
      className="w-full max-w-lg mx-auto px-4 page-enter"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ArenaSurface variant="reading" className="space-y-6 rounded-3xl p-8 text-center shadow-[0_24px_80px_rgba(76,29,149,0.12)] md:p-10">
        <div className="relative overflow-hidden rounded-[28px] border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10 px-6 py-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-white/5 dark:text-slate-300">
            Resultado final
          </div>
          <div className="relative inline-block">
            <div className={`orbitron bg-gradient-to-br text-7xl font-black text-transparent bg-clip-text md:text-8xl ${gradeColors[grade]}`}>
              {grade}
            </div>
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 opacity-20 blur-3xl" />
          </div>

          <div className="mt-4">
            <div className="mb-3 text-5xl">{emoji}</div>
            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-slate-50 md:text-3xl">
              {title}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {points}/{totalQuestions * 4} pontos • {time.toFixed(1)}s
            </p>
          </div>
        </div>

        {description ? (
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-[15px]">
            {description}
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <ArenaSurface key={stat.label} variant="soft" className="rounded-xl border border-white/12 p-3">
              <div className="mb-2 flex justify-center">
                <stat.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <div className={`orbitron text-lg font-black ${stat.valueClassName}`}>{stat.value}</div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
            </ArenaSurface>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <Button onClick={onLeaderboard} size="lg" className="neon-btn neon-btn-strong rank-cta w-full rounded-2xl px-4 py-5 font-bold">
            <span className="rank-cta__icon">
              <Trophy className="h-5 w-5" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-sm uppercase tracking-[0.18em] text-white/70">Ranking</span>
              <span className="mt-0.5 flex items-center gap-2 text-base text-white">
                Entrar no placar e guardar resultado
                <Sparkles className="h-4 w-4 text-amber-200" />
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-white/85" />
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onRestart} variant="outline" size="lg"
              className="rounded-xl border-slate-300/90 bg-white py-4 font-bold text-slate-800 shadow-sm transition-all hover:bg-white dark:border-white/12 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Jogar de novo
            </Button>
            <Button onClick={onShare} variant="outline" size="lg"
              className="rounded-xl border-cyan-300/70 bg-cyan-50 py-4 font-bold text-cyan-900 shadow-sm transition-all hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100 dark:hover:bg-cyan-500/14">
              <Share2 className="w-4 h-4 mr-1.5" />
              Compartilhar
            </Button>
          </div>
        </div>
      </ArenaSurface>
    </motion.div>
  );
}
