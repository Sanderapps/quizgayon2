import React from 'react';

// ==================== TÍTULOS E FRASES ====================

const ALPHA_TITLES = [
  { min: 95, max: 100, title: "Chad Supremo", emoji: "🗿" },
  { min: 90, max: 94, title: "Machão Raiz", emoji: "💪" },
  { min: 85, max: 89, title: "Hetero Top", emoji: "🏋️" },
  { min: 80, max: 84, title: "Brother Firmeza", emoji: "🍺" },
  { min: 75, max: 79, title: "Macho Alfa", emoji: "🦁" },
  { min: 70, max: 74, title: "Carne de Pescoço", emoji: "🥩" },
  { min: 65, max: 69, title: "Barba de Lenhador", emoji: "🪓" },
  { min: 60, max: 64, title: "Sertanejo Universitário", emoji: "🤠" },
  { min: 55, max: 59, title: "Tiozão do Churrasco", emoji: "🔥" },
  { min: 50, max: 54, title: "Brother Aliado", emoji: "🤝" },
];

const ALPHA_PHRASES_BY_RANK: Record<number, string> = {
  1: "Nunca vi uma flor", 2: "Só usa sabonete 3 em 1", 3: "Churrasco todo domingo",
  4: "Cerveja é vitamina", 5: "Camisa de time é roupa social", 6: "Academia 6x por semana",
  7: "Futebol é religião", 8: "Carne mal passada sempre", 9: "Brother firmeza", 10: "Respeita as mina",
};

const DIVA_PHRASES_BY_RANK: Record<number, string> = {
  1: "Rainha absoluta, periodt", 2: "Lacrou demais, mana", 3: "Diva certified",
  4: "Arrasa sempre", 5: "Glamour é o mínimo", 6: "Slay queen energy",
  7: "Fabulosa por natureza", 8: "Brilha mais que glitter", 9: "Diva em construção", 10: "Quase lá, querida",
};

interface Badge { icon: string; title: string; condition: (p: number, t?: number) => boolean; }

const ALPHA_BADGES: Badge[] = [
  { icon: "🏆", title: "Hetero Raiz", condition: (p) => p < 5 },
  { icon: "💪", title: "Machão Confirmado", condition: (p) => p < 10 },
  { icon: "⚡", title: "Speedrun Alpha", condition: (p, t) => t !== undefined && t < 30 },
  { icon: "🤝", title: "Aliado Confiável", condition: (p) => p >= 40 && p < 50 },
];

function getAlphaTitle(p: number) { return ALPHA_TITLES.find(t => p >= t.min && p <= t.max) || { title: "Brother Aliado", emoji: "🤝" }; }
function getAlphaPhrase(r: number) { return ALPHA_PHRASES_BY_RANK[r] || "Brother gente boa"; }
function getDivaPhrase(r: number) { return DIVA_PHRASES_BY_RANK[r] || "Diva em ascensão"; }
function getAlphaBadges(p: number, t?: number) { return ALPHA_BADGES.filter(b => b.condition(p, t)); }

// ==================== COR POR % ====================

function getPercentColor(p: number): string {
  if (p >= 99) return 'from-pink-500 via-purple-500 to-cyan-500';
  if (p >= 90) return 'from-pink-600 to-fuchsia-600';
  if (p >= 80) return 'from-pink-600 to-rose-600';
  if (p >= 70) return 'from-red-500 to-fuchsia-600';
  if (p >= 60) return 'from-purple-600 to-violet-600';
  if (p >= 50) return 'from-violet-600 to-blue-500';
  if (p >= 40) return 'from-cyan-600 to-sky-600';
  if (p >= 30) return 'from-teal-600 to-emerald-600';
  if (p >= 20) return 'from-blue-700 to-blue-800';
  if (p >= 10) return 'from-stone-600 to-gray-700';
  return 'from-gray-700 to-gray-900';
}

function getPercentTextColor(p: number): string {
  if (p >= 80) return 'text-pink-400';
  if (p >= 70) return 'text-red-400';
  if (p >= 60) return 'text-purple-400';
  if (p >= 50) return 'text-violet-400';
  if (p >= 40) return 'text-cyan-400';
  if (p >= 30) return 'text-emerald-400';
  if (p >= 20) return 'text-blue-400';
  return 'text-gray-400';
}

// ==================== RANK BADGE ====================

const RankBadge = ({ rank, category }: { rank: number; category: 'divas' | 'alfas' }) => {
  if (rank === 1) return <span className="text-2xl">{category === 'divas' ? '👑' : '🗿'}</span>;
  if (rank === 2) return <span className="text-xl">{category === 'divas' ? '⭐' : '🍺'}</span>;
  if (rank === 3) return <span className="text-xl">{category === 'divas' ? '💎' : '🔧'}</span>;
  if (rank <= 6) return <span className="text-lg">{category === 'divas' ? '✨' : '💪'}</span>;
  return <span className="text-base">⭐</span>;
};

// ==================== MAIN COMPONENT ====================

interface LeaderEntry {
  name: string; percentage: number; result: string; date: string; tempo_segundos?: number;
}

export const Leaderboard = ({ leaderboard, maxItems = 50 }: { leaderboard: LeaderEntry[]; maxItems?: number }) => {
  if (leaderboard.length === 0) {
    return (
      <div className="dark:bg-[#0e0e1a]/80 bg-white/80 backdrop-blur-xl rounded-2xl p-8 dark:border border-purple-500/10 border-gray-200">
        <h2 className="text-2xl font-bold mb-3 text-center dark:text-white text-gray-900">🏆 Placar de Líderes</h2>
        <p className="text-center dark:text-gray-500 text-gray-400 text-sm">Nenhum resultado ainda. Seja o primeiro!</p>
      </div>
    );
  }

  const divas = leaderboard.filter(e => e.percentage >= 50).slice(0, maxItems);
  const alfas = leaderboard.filter(e => e.percentage < 50).sort((a, b) => a.percentage - b.percentage).slice(0, maxItems);

  const renderEntry = (entry: LeaderEntry, index: number, category: 'divas' | 'alfas') => {
    const rank = index + 1;
    const displayPercentage = category === 'alfas' ? 100 - entry.percentage : entry.percentage;
    const customTitle = category === 'alfas' ? getAlphaTitle(displayPercentage).title : entry.result;
    const customPhrase = category === 'alfas' ? getAlphaPhrase(rank) : getDivaPhrase(rank);
    const alphaBadges = category === 'alfas' ? getAlphaBadges(entry.percentage, entry.tempo_segundos) : [];

    const isTop3 = rank <= 3;
    const rankBg = rank === 1 ? 'dark:from-amber-500/10 dark:to-amber-500/5 from-amber-50 to-amber-50/50' :
                   rank === 2 ? 'dark:from-gray-400/10 dark:to-gray-400/5 from-gray-50 to-gray-50/50' :
                   rank === 3 ? 'dark:from-orange-500/10 dark:to-orange-500/5 from-orange-50 to-orange-50/50' :
                   'dark:from-white/[0.02] dark:to-transparent from-gray-50/50 to-transparent';

    return (
      <div key={`${category}-${index}`} className={`relative flex justify-between items-center p-2.5 rounded-xl bg-gradient-to-r ${rankBg} leaderboard-row transition-all hover:bg-white/5`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Rank */}
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${
            rank === 1 ? 'bg-amber-500/20 text-amber-400' :
            rank === 2 ? 'bg-gray-400/20 text-gray-400' :
            rank === 3 ? 'bg-orange-500/20 text-orange-400' :
            'dark:bg-white/5 bg-gray-100 dark:text-gray-500 text-gray-400'
          }`}>
            {rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <RankBadge rank={rank} category={category} />
              <p className={`font-bold text-sm truncate ${getPercentTextColor(entry.percentage)} dark:text-gray-200`}>
                {entry.name}
                {category === 'alfas' && alphaBadges.length > 0 && (
                  <span className="ml-1">{alphaBadges.map((b, i) => <span key={i} className="text-xs" title={b.title}>{b.icon}</span>)}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r ${getPercentColor(entry.percentage)} text-white`}>
                {customTitle}
              </span>
              <span className="text-[10px] dark:text-gray-600 text-gray-400 italic truncate max-w-[120px]">
                "{customPhrase}"
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 ml-2">
          <span className="orbitron text-lg font-black dark:text-white text-gray-900">{displayPercentage}%</span>
          {entry.tempo_segundos && rank <= 3 && (
            <span className="text-[9px] dark:text-gray-600 text-gray-400 font-mono">{entry.tempo_segundos.toFixed(1)}s</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dark:bg-[#0e0e1a]/80 bg-white/80 backdrop-blur-xl rounded-2xl p-5 md:p-8 dark:border border-purple-500/10 border-gray-200 max-h-[700px] overflow-y-auto">
      <h2 className="orbitron text-xl md:text-3xl font-black mb-6 text-center">
        <span className="dark:text-white text-gray-900">🏆 </span>
        <span className="neon-text">Placar de Líderes</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Divas */}
        <div>
          <h3 className="text-sm font-bold mb-3 text-center text-pink-500 flex items-center justify-center gap-2">
            <span className="text-lg">👑</span> Top Divas
          </h3>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {divas.length > 0 ? divas.map((e, i) => renderEntry(e, i, 'divas')) : (
              <p className="text-center dark:text-gray-600 text-gray-400 text-xs py-8">Nenhuma diva ainda!</p>
            )}
          </div>
        </div>

        {/* Alfas */}
        <div>
          <h3 className="text-sm font-bold mb-3 text-center text-blue-500 flex items-center justify-center gap-2">
            <span className="text-lg">💪</span> Top Alpha
          </h3>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {alfas.length > 0 ? alfas.map((e, i) => renderEntry(e, i, 'alfas')) : (
              <p className="text-center dark:text-gray-600 text-gray-400 text-xs py-8">Nenhum alpha ainda!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
