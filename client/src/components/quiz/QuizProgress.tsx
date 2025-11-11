interface QuizProgressProps {
  current: number;
  total: number;
  percentage: number;
}

/**
 * Barra de progresso do quiz
 */
export function QuizProgress({ current, total, percentage }: QuizProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/80">
          Pergunta {current} de {total}
        </span>
        <span className="text-sm text-white/80">
          {Math.round(percentage)}%
        </span>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
