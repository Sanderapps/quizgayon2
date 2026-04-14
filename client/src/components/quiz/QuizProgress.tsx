interface QuizProgressProps {
  current: number;
  total: number;
  points: number;
  maxPoints: number;
}

export function QuizProgress({ current, total, points, maxPoints }: QuizProgressProps) {
  const progress = ((current + 1) / total) * 100;
  const pct = Math.round((points / maxPoints) * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-6">
      {/* Top bar: progress + score */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold dark:text-gray-400 text-gray-500">
          {current + 1} <span className="dark:text-gray-600 text-gray-400">/ {total}</span>
        </span>
        <div className="flex items-center gap-2">
          <div className="orbitron text-sm font-black neon-text">{pct}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-neon">
        <div className="progress-neon-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
