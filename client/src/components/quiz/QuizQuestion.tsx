import { motion } from "framer-motion";

interface Question {
  id: number;
  text: string;
  emoji?: string;
  answers: { text: string; points: number }[];
}

interface QuizQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (points: number, answerIndex: number) => void;
  selectedAnswer: number | null;
}

const answerGradients = [
  "from-purple-600/20 to-purple-600/5 hover:from-purple-600/30 hover:to-purple-600/10",
  "from-cyan-600/20 to-cyan-600/5 hover:from-cyan-600/30 hover:to-cyan-600/10",
  "from-pink-600/20 to-pink-600/5 hover:from-pink-600/30 hover:to-pink-600/10",
  "from-amber-600/20 to-amber-600/5 hover:from-amber-600/30 hover:to-amber-600/10",
];

const answerBorders = [
  "hover:border-purple-500/50",
  "hover:border-cyan-500/50",
  "hover:border-pink-500/50",
  "hover:border-amber-500/50",
];

export function QuizQuestion({ question, questionIndex, totalQuestions, onAnswer, selectedAnswer }: QuizQuestionProps) {
  return (
    <motion.div
      className="question-enter mx-auto w-full max-w-3xl"
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="quiz-reading-surface rounded-[28px] p-5 md:p-8">
        <div className="mb-6 border-b border-slate-200/70 pb-5 text-center dark:border-white/8 md:mb-7">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            <span>Rodada {questionIndex + 1}</span>
            <span className="text-slate-400 dark:text-slate-600">de {totalQuestions}</span>
          </div>
          <h2 className="mx-auto max-w-2xl text-balance text-xl font-semibold leading-relaxed text-slate-900 dark:text-slate-50 md:text-[1.9rem] md:leading-[1.45]">
            {question.text}
          </h2>
        </div>

        <div className="space-y-3">
          {question.answers.map((answer, i) => {
            const isSelected = selectedAnswer === i;
            return (
              <button
                key={i}
                onClick={() => onAnswer(answer.points, i)}
                disabled={selectedAnswer !== null}
                className={`answer-option w-full touch-manipulation rounded-2xl border p-4 text-left transition-all duration-150 disabled:cursor-default md:p-5 ${
                  isSelected
                    ? "scale-[1.01] border-fuchsia-500/50 bg-fuchsia-500/10 shadow-[0_10px_30px_rgba(217,70,239,0.12)] dark:border-purple-400/60 dark:bg-purple-500/12"
                    : `bg-gradient-to-r ${answerGradients[i]} ${answerBorders[i]}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      isSelected
                        ? "bg-fuchsia-500 text-white dark:bg-purple-500"
                        : "bg-slate-100 text-slate-600 dark:bg-white/6 dark:text-slate-300"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100 md:text-base">
                    {answer.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
