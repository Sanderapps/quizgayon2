import { RankBadge } from "./RankBadge";

interface LeaderEntry {
  name: string;
  percentage: number;
  result: string;
  date: string;
  tempo_segundos?: number;
}

interface LeaderboardProps {
  leaderboard: LeaderEntry[];
  maxItems?: number;
}

export const Leaderboard = ({ leaderboard, maxItems = 12 }: LeaderboardProps) => {
  if (leaderboard.length === 0) {
    return (
      <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-lg shadow-2xl p-8 border-2 border-white/30 dark:border-gray-700">
        <h2 className="text-4xl font-bold mb-6 text-center text-white drop-shadow-lg">
          🏆 Placar de Líderes 🏆
        </h2>
        <p className="text-center text-white text-lg">Nenhum resultado ainda. Seja o primeiro!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-lg shadow-2xl p-8 border-2 border-white/30 dark:border-gray-700">
      <h2 className="text-4xl font-bold mb-6 text-center text-white drop-shadow-lg">
        🏆 Placar de Líderes 🏆
      </h2>
      <div className="space-y-2">
        {leaderboard.slice(0, maxItems).map((entry, index) => {
          const rank = index + 1;
          
          // Estilos personalizados por colocação
          let bgGradient, borderClass, glowClass, nameColor, badgeBg, rankColor;
          
          if (rank === 1) {
            bgGradient = 'from-yellow-100 via-yellow-50 to-amber-100';
            borderClass = 'border-4 border-yellow-400';
            glowClass = 'shadow-[0_0_25px_rgba(255,215,0,0.9)] animate-pulse';
            nameColor = 'text-yellow-700';
            badgeBg = 'bg-yellow-200';
            rankColor = 'text-yellow-600';
          } else if (rank === 2) {
            bgGradient = 'from-gray-100 via-gray-50 to-slate-100';
            borderClass = 'border-3 border-gray-400';
            glowClass = 'shadow-[0_0_20px_rgba(192,192,192,0.8)]';
            nameColor = 'text-gray-700';
            badgeBg = 'bg-gray-200';
            rankColor = 'text-gray-600';
          } else if (rank === 3) {
            bgGradient = 'from-orange-100 via-orange-50 to-amber-100';
            borderClass = 'border-3 border-orange-400';
            glowClass = 'shadow-[0_0_20px_rgba(205,127,50,0.8)]';
            nameColor = 'text-orange-700';
            badgeBg = 'bg-orange-200';
            rankColor = 'text-orange-600';
          } else if (rank <= 6) {
            bgGradient = 'from-pink-200 via-purple-200 to-blue-200';
            borderClass = 'border-2 border-purple-300';
            glowClass = 'shadow-md';
            nameColor = 'text-purple-800';
            badgeBg = 'bg-purple-100';
            rankColor = 'text-purple-600';
          } else {
            bgGradient = 'from-pink-100 to-purple-100';
            borderClass = 'border border-purple-200';
            glowClass = 'shadow-sm';
            nameColor = 'text-gray-800';
            badgeBg = 'bg-purple-50';
            rankColor = 'text-purple-500';
          }
          
          return (
            <div key={index} className={`flex justify-between items-center p-2 bg-gradient-to-r ${bgGradient} rounded-lg hover:scale-[1.01] transition-all duration-300 ${borderClass} ${glowClass}`}>
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col items-center">
                  <span className={`text-sm font-bold ${rankColor}`}>#{rank}</span>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-base ${nameColor}`}>{entry.name}</p>
                  <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${badgeBg} text-gray-700 font-medium`}>{entry.result}</p>
                  <p className="text-xs text-gray-600">{entry.date} {entry.tempo_segundos && rank <= 3 ? <span className="font-bold text-purple-600">({entry.tempo_segundos.toFixed(2)}s)</span> : entry.tempo_segundos ? `(${entry.tempo_segundos.toFixed(2)}s)` : ""}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <RankBadge rank={rank} />
                <p className={`font-bold text-base ${rankColor}`}>{entry.percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
