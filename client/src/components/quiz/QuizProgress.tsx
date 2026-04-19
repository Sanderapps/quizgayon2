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
    <div className="mx-auto mb-2 w-full max-w-3xl px-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {current + 1} <span className="text-slate-600">/ {total}</span>
        </span>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-black text-slate-100">
          <span className="neon-text">{pct}%</span>
        </div>
      </div>

      <div className="progress-neon">
        <div className="progress-neon-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
