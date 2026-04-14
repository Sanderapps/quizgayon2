import { Link } from "wouter";
import { allQuizzes } from "@/data/quizzes";
import { TopMenu } from "@/components/TopMenu";
import { ChatWidget } from "@/components/ChatWidget";
import { RadioPlayer } from "@/components/RadioPlayer";
import { motion } from "framer-motion";
import { Rainbow, Vote, MapPin, Zap, Trophy, Users } from "lucide-react";

// Mapeamento de ícones + cores neon para cada quiz
const quizConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  glowColor: string;
  accentFrom: string;
  accentTo: string;
  tag: string;
}> = {
  "gay": {
    icon: Rainbow,
    gradient: "linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #06b6d4 100%)",
    glowColor: "rgba(236, 72, 153, 0.4)",
    accentFrom: "#ec4899",
    accentTo: "#a855f7",
    tag: "🔥 MAIS POPULAR",
  },
  "politico": {
    icon: Vote,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    glowColor: "rgba(245, 158, 11, 0.4)",
    accentFrom: "#f59e0b",
    accentTo: "#ef4444",
    tag: "⚡ POLÊMICO",
  },
  "regional": {
    icon: MapPin,
    gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    glowColor: "rgba(16, 185, 129, 0.4)",
    accentFrom: "#10b981",
    accentTo: "#06b6d4",
    tag: "🗺️ REGIONAL",
  },
};

export default function QuizSelector() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layer */}
      <div className="fixed inset-0 dark:bg-[#06060e] bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50" />

      {/* Animated orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 dark:opacity-10"
          style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-15 dark:opacity-10"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -25, 0], y: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/4 w-72 h-72 rounded-full opacity-15 dark:opacity-8"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <TopMenu />
        <ChatWidget />
        <RadioPlayer />

        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-10 md:mb-16"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo/Brand */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/20 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wider uppercase">
                  ArenaQuiz
                </span>
              </motion.div>

              <h1 className="orbitron text-5xl sm:text-6xl md:text-7xl font-black mb-4 tracking-tight">
                <span className="dark:text-white text-gray-900">Qui</span>
                <span className="neon-text">Zoeira</span>
              </h1>

              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                Escolha sua arena. Responda. Domine o ranking.
              </p>

              {/* Stats bar */}
              <motion.div
                className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400 dark:text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Ranking ao vivo
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-500" />
                  Multiplayer
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-500" />
                  100% anônimo
                </span>
              </motion.div>
            </motion.div>

            {/* Quiz Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
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
                        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 dark:hover:translate-y-[-8px]"
                        style={{
                          background: "linear-gradient(135deg, rgba(15, 15, 35, 0.9) 0%, rgba(10, 10, 25, 0.95) 100%)",
                          border: "1px solid rgba(139, 92, 246, 0.15)",
                          boxShadow: `0 0 15px ${config.glowColor.replace("0.4", "0.1")}, 0 8px 32px rgba(0, 0, 0, 0.3)`,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = config.accentFrom;
                          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor.replace("0.4", "0.15")}, 0 12px 40px rgba(0, 0, 0, 0.4)`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139, 92, 246, 0.15)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 15px ${config.glowColor.replace("0.4", "0.1")}, 0 8px 32px rgba(0, 0, 0, 0.3)`;
                        }}
                      >
                        {/* Tag */}
                        <div className="absolute top-3 left-3 z-10">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider"
                            style={{
                              background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})`,
                              color: "white",
                              boxShadow: `0 0 8px ${config.glowColor}`,
                            }}
                          >
                            {config.tag}
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="flex flex-col items-center justify-center p-6 md:p-8 min-h-[240px] md:min-h-[280px]">
                          {/* Icon */}
                          <motion.div
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mb-5 relative"
                            style={{ background: config.gradient }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-lg" />
                            {/* Glow behind icon */}
                            <div
                              className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                              style={{ background: config.gradient }}
                            />
                          </motion.div>

                          {/* Title */}
                          <h2
                            className="text-lg md:text-xl font-bold text-center mb-2"
                            style={{
                              background: config.gradient,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {quiz.title.replace(/[^\w\s]/gi, "").trim()}
                          </h2>

                          {/* Description */}
                          <p className="text-xs md:text-sm text-gray-400 text-center mb-5">
                            {quiz.description}
                          </p>

                          {/* CTA */}
                          <div
                            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all opacity-90 group-hover:opacity-100"
                            style={{
                              background: config.gradient,
                              boxShadow: `0 0 12px ${config.glowColor}`,
                            }}
                          >
                            Entrar na Arena →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <motion.div
              className="text-center mt-10 md:mt-14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-gray-400 dark:text-gray-600 text-xs">
                🎮 Sem login • Sem cadastro • Só competir
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
