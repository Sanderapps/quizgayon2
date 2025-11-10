import { RankBadge } from "./RankBadge";

// Função que retorna classes Tailwind baseadas na porcentagem (34 categorias)
function getCategoryBadgeColor(percentage: number): string {
  if (percentage >= 99) return 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white animate-pulse';
  if (percentage >= 96) return 'bg-gradient-to-r from-pink-600 to-rose-600 text-white';
  if (percentage >= 93) return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white';
  if (percentage >= 90) return 'bg-gradient-to-r from-pink-500 to-purple-500 text-white';
  if (percentage >= 87) return 'bg-pink-700 text-white';
  if (percentage >= 84) return 'bg-red-500 text-white';
  if (percentage >= 81) return 'bg-rose-600 text-white';
  if (percentage >= 78) return 'bg-pink-600 text-white';
  if (percentage >= 75) return 'bg-fuchsia-500 text-white';
  if (percentage >= 72) return 'bg-purple-500 text-white';
  if (percentage >= 69) return 'bg-indigo-500 text-white';
  if (percentage >= 66) return 'bg-blue-500 text-white';
  if (percentage >= 63) return 'bg-sky-500 text-white';
  if (percentage >= 60) return 'bg-cyan-500 text-gray-900';
  if (percentage >= 57) return 'bg-teal-500 text-white';
  if (percentage >= 54) return 'bg-green-500 text-white';
  if (percentage >= 51) return 'bg-lime-500 text-gray-900';
  if (percentage >= 48) return 'bg-yellow-500 text-gray-900';
  if (percentage >= 45) return 'bg-amber-500 text-white';
  if (percentage >= 42) return 'bg-orange-500 text-white';
  if (percentage >= 39) return 'bg-pink-400 text-gray-900';
  if (percentage >= 36) return 'bg-pink-500 text-white';
  if (percentage >= 33) return 'bg-pink-600 text-white';
  if (percentage >= 30) return 'bg-purple-500 text-white';
  if (percentage >= 27) return 'bg-purple-600 text-white';
  if (percentage >= 24) return 'bg-indigo-600 text-white';
  if (percentage >= 21) return 'bg-blue-600 text-white';
  if (percentage >= 18) return 'bg-blue-800 text-white';
  if (percentage >= 15) return 'bg-blue-900 text-white';
  if (percentage >= 12) return 'bg-gray-600 text-white';
  if (percentage >= 9) return 'bg-gray-700 text-white';
  if (percentage >= 6) return 'bg-gray-800 text-white';
  if (percentage >= 3) return 'bg-gray-900 text-white';
  return 'bg-black text-white'; // 0%
}

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
      <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-lg shadow-2xl p-4 sm:p-8 border-2 border-white/30 dark:border-gray-700">
        <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center text-white drop-shadow-lg">
          🏆 Placar de Líderes 🏆
        </h2>
        <p className="text-center text-white text-base sm:text-lg">Nenhum resultado ainda. Seja o primeiro!</p>
      </div>
    );
  }

  // Dividir em Divas (>=50%) e Alfas (<50%)
  const divas = leaderboard.filter(entry => entry.percentage >= 50).slice(0, maxItems);
  const alfas = leaderboard.filter(entry => entry.percentage < 50).slice(0, maxItems);

  const renderEntry = (entry: LeaderEntry, index: number, category: 'divas' | 'alfas') => {
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
      borderClass = 'border-3 border-gray-300';
      glowClass = 'shadow-[0_0_20px_rgba(229,231,235,0.9)] animate-pulse';
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
      <div key={`${category}-${index}`} className={`flex justify-between items-center p-2 bg-gradient-to-r ${bgGradient} rounded-lg hover:scale-[1.01] transition-all duration-300 ${borderClass} ${glowClass}`}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          <div className="flex flex-col items-center">
            <span className={`text-xs sm:text-sm font-bold ${rankColor}`}>#{rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm sm:text-base ${nameColor} truncate`}>{entry.name}</p>
            <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${getCategoryBadgeColor(entry.percentage)} font-medium truncate max-w-full`}>{entry.result}</p>
            <p className="text-xs text-gray-600">{entry.date} {entry.tempo_segundos && rank <= 3 ? <span className="font-bold text-purple-600">({entry.tempo_segundos.toFixed(2)}s)</span> : entry.tempo_segundos ? `(${entry.tempo_segundos.toFixed(2)}s)` : ""}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <RankBadge rank={rank} category={category} />
          <p className={`font-bold text-sm sm:text-base ${rankColor}`}>{entry.percentage}%</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-lg shadow-2xl p-4 sm:p-8 border-2 border-white/30 dark:border-gray-700">
      <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center text-white drop-shadow-lg">
        🏆 Placar de Líderes 🏆
      </h2>
      
      {/* Layout Mobile: Stack vertical */}
      {/* Layout Desktop: 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Divas */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-pink-300 drop-shadow-lg">
            👑 Top Divas
          </h3>
          <div className="space-y-2">
            {divas.length > 0 ? (
              divas.map((entry, index) => renderEntry(entry, index, 'divas'))
            ) : (
              <p className="text-center text-white/70 text-sm">Nenhuma diva ainda!</p>
            )}
          </div>
        </div>

        {/* Top Alfas */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-blue-300 drop-shadow-lg">
            💪 Top Alfas
          </h3>
          <div className="space-y-2">
            {alfas.length > 0 ? (
              alfas.map((entry, index) => renderEntry(entry, index, 'alfas'))
            ) : (
              <p className="text-center text-white/70 text-sm">Nenhum alfa ainda!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
