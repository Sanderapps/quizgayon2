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
  onAnswer: (points: number) => void;
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

export function QuizQuestion({ question, questionIndex, onAnswer, selectedAnswer }: QuizQuestionProps) {
  return (
    <motion.div
      className="question-enter mx-auto w-full max-w-3xl"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
    >
      <div className="quiz-reading-surface rounded-[28px] p-5 md:p-8">
        <div className="mb-6 border-b border-white/8 pb-5 text-center md:mb-7">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>Pergunta</span>
            <span className="text-slate-600">{questionIndex + 1}</span>
          </div>
          {question.emoji && <span className="mb-3 inline-block text-4xl">{question.emoji}</span>}
          <h2 className="mx-auto max-w-2xl text-balance text-xl font-semibold leading-relaxed text-slate-50 md:text-[1.9rem] md:leading-[1.45]">
            {question.text}
          </h2>
        </div>

        <div className="space-y-3">
          {question.answers.map((answer, i) => {
            const isSelected = selectedAnswer === i;
            return (
              <button
                key={i}
                onClick={() => onAnswer(answer.points)}
                disabled={selectedAnswer !== null}
                className={`answer-option w-full rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-default md:p-5 ${
                  isSelected
                    ? "scale-[1.01] border-purple-400/60 bg-purple-500/12 shadow-lg"
                    : `bg-gradient-to-r ${answerGradients[i]} ${answerBorders[i]}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      isSelected
                        ? "bg-purple-500 text-white"
                        : "bg-white/6 text-slate-300"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-sm font-medium leading-relaxed text-slate-100 md:text-base">
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
