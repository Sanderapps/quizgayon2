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
      className="w-full max-w-xl mx-auto px-4 question-enter"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
    >
      {/* Question */}
      <div className="mb-6 text-center">
        {question.emoji && (
          <span className="text-4xl mb-3 inline-block">{question.emoji}</span>
        )}
        <h2 className="orbitron text-lg md:text-xl font-bold dark:text-white text-gray-900 leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {question.answers.map((answer, i) => {
          const isSelected = selectedAnswer === i;
          return (
            <button
              key={i}
              onClick={() => onAnswer(answer.points)}
              disabled={selectedAnswer !== null}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 bg-gradient-to-r ${answerGradients[i]} ${answerBorders[i]} border dark:border-white/[0.06] border-gray-200 disabled:cursor-default ${
                isSelected
                  ? 'dark:border-purple-500/60 border-purple-400 dark:bg-purple-500/15 bg-purple-50 scale-[1.02] shadow-lg'
                  : 'dark:text-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Answer letter */}
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  isSelected
                    ? 'bg-purple-500 text-white'
                    : 'dark:bg-white/5 bg-gray-100 dark:text-gray-500 text-gray-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm md:text-base font-medium flex-1">{answer.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
