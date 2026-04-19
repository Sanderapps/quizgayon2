import { Link } from "wouter";
import { allQuizzes } from "@/data/quizzes";
import { ArenaPageShell } from "@/components/layout/ArenaPageShell";
import { ArenaSurface } from "@/components/layout/ArenaSurface";
import { motion } from "framer-motion";
import { Rainbow, Vote, MapPin, Zap, Trophy, Users } from "lucide-react";

// Mapeamento de ícones + cores neon para cada quiz
const quizConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  themeClass: string;
  tag: string;
}> = {
  "gay": {
    icon: Rainbow,
    themeClass: "quiz-theme-gay",
    tag: "🔥 MAIS POPULAR",
  },
  "politico": {
    icon: Vote,
    themeClass: "quiz-theme-politico",
    tag: "⚡ POLÊMICO",
  },
  "regional": {
    icon: MapPin,
    themeClass: "quiz-theme-regional",
    tag: "🗺️ REGIONAL",
  },
};

export default function QuizSelector() {
  return (
    <ArenaPageShell rootClassName="overflow-hidden" shellClassName="flex min-h-screen flex-col">
      <div className="flex-1 px-4 pb-24 pt-24 md:pt-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            <motion.div
              className="mx-auto w-full max-w-3xl text-center"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wider uppercase">
                  Neon Arena
                </span>
              </motion.div>

              <h1 className="orbitron mb-4 text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
                <span className="text-slate-50">Qui</span>
                <span className="neon-text">Zoeira</span>
              </h1>

              <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                Escolha sua arena. Responda. Domine o ranking.
              </p>

              <motion.div
                className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 md:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="arena-panel-soft flex items-center gap-1.5 rounded-full px-3 py-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Ranking ao vivo
                </span>
                <span className="arena-panel-soft flex items-center gap-1.5 rounded-full px-3 py-2">
                  <Users className="w-3.5 h-3.5 text-cyan-500" />
                  Multiplayer
                </span>
                <span className="arena-panel-soft flex items-center gap-1.5 rounded-full px-3 py-2">
                  <Zap className="w-3.5 h-3.5 text-purple-500" />
                  100% anônimo
                </span>
              </motion.div>
            </motion.div>

            <ArenaSurface variant="panel" className="mx-auto w-full max-w-6xl rounded-3xl p-4 sm:p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-2 border-b border-white/8 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">Escolha o modo de jogo</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    Cada quiz entra na mesma arena, com menos ruído visual e mais foco na pergunta.
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">3 arenas disponíveis</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                {allQuizzes.map((quiz, index) => {
                  const config = quizConfig[quiz.id] || quizConfig["gay"];
                  const IconComponent = config.icon;

                  return (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 40, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                    >
                      <Link href={`/quiz/${quiz.slug}`}>
                        <div
                          className={`quiz-card-shell group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${config.themeClass}`}
                        >
                          <div className="absolute top-3 left-3 z-10">
                            <span className="quiz-card-tag rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider">
                              {config.tag}
                            </span>
                          </div>

                          <div className="flex min-h-[240px] flex-col items-center justify-center p-6 md:min-h-[280px] md:p-8">
                            <motion.div
                              className="quiz-card-icon relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl md:h-24 md:w-24"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <IconComponent className="h-10 w-10 text-white drop-shadow-lg md:h-12 md:w-12" />
                              <div className="quiz-card-icon-glow absolute inset-0 rounded-2xl blur-xl" />
                            </motion.div>

                            <h2 className="mb-2 text-center text-lg font-bold text-slate-50 md:text-xl">
                              {quiz.title.replace(/[^\w\s]/gi, "").trim()}
                            </h2>

                            <p className="mb-5 text-center text-sm leading-relaxed text-slate-300">
                              {quiz.description}
                            </p>

                            <div className="quiz-card-cta rounded-lg px-5 py-2 text-sm font-bold text-white transition-all opacity-95 group-hover:opacity-100">
                              Entrar na Arena →
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </ArenaSurface>

            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-xs text-slate-400">
                Sem login • Sem cadastro • Só competir
              </p>
            </motion.div>
        </div>
      </div>
    </ArenaPageShell>
  );
}
