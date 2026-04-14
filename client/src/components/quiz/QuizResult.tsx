import { Button } from "@/components/ui/button";
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

  return (
    <motion.div
      className="w-full max-w-lg mx-auto px-4 page-enter"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="neon-card rounded-3xl p-8 md:p-10 text-center space-y-6">
        {/* Grade */}
        <div className="relative inline-block">
          <div className={`orbitron text-7xl md:text-8xl font-black bg-gradient-to-br ${gradeColors[grade]} bg-clip-text text-transparent`}>
            {grade}
          </div>
          <div className="absolute -inset-4 blur-3xl opacity-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full" />
        </div>

        {/* Result title */}
        <div>
          <div className="text-5xl mb-3">{emoji}</div>
          <h2 className="orbitron text-xl md:text-2xl font-black dark:text-white text-gray-900 mb-2">
            {title}
          </h2>
          <p className="dark:text-gray-400 text-gray-500 text-sm">
            {points}/{totalQuestions * 4} pontos • {time.toFixed(1)}s
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="dark:bg-white/5 bg-gray-50 rounded-xl p-3 dark:border border-purple-500/10 border-gray-200">
            <div className="orbitron text-lg font-black neon-text">{percentage}%</div>
            <div className="text-[10px] dark:text-gray-500 text-gray-400 font-medium mt-1">Nível</div>
          </div>
          <div className="dark:bg-white/5 bg-gray-50 rounded-xl p-3 dark:border border-purple-500/10 border-gray-200">
            <div className="orbitron text-lg font-black dark:text-cyan-400 text-cyan-600">{time.toFixed(0)}s</div>
            <div className="text-[10px] dark:text-gray-500 text-gray-400 font-medium mt-1">Tempo</div>
          </div>
          <div className="dark:bg-white/5 bg-gray-50 rounded-xl p-3 dark:border border-purple-500/10 border-gray-200">
            <div className="orbitron text-lg font-black dark:text-amber-400 text-amber-600">{points}</div>
            <div className="text-[10px] dark:text-gray-500 text-gray-400 font-medium mt-1">Pontos</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={onLeaderboard} size="lg"
            className="w-full py-5 rounded-xl font-bold neon-btn">
            <Trophy className="w-5 h-5" />
            Ver Ranking
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onRestart} variant="outline" size="lg"
              className="py-4 rounded-xl font-bold dark:bg-white/5 bg-gray-50 dark:text-gray-300 text-gray-700 dark:border-purple-500/20 border-gray-200 dark:hover:bg-white/10 hover:bg-gray-100 transition-all">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Jogar de Novo
            </Button>
            <Button onClick={onShare} variant="outline" size="lg"
              className="py-4 rounded-xl font-bold dark:bg-white/5 bg-gray-50 dark:text-gray-300 text-gray-700 dark:border-purple-500/20 border-gray-200 dark:hover:bg-white/10 hover:bg-gray-100 transition-all">
              <Share2 className="w-4 h-4 mr-1.5" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
