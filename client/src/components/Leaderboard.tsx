import React from 'react';

// ==================== ESTRUTURA DE DADOS ====================

// Títulos por faixa de % Alpha (invertida: 0% quiz = 100% alpha)
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

// Frases por RANK (posição no placar) - Alpha
const ALPHA_PHRASES_BY_RANK: Record<number, string> = {
  1: "Nunca vi uma flor",
  2: "Só usa sabonete 3 em 1",
  3: "Churrasco todo domingo",
  4: "Cerveja é vitamina",
  5: "Camisa de time é roupa social",
  6: "Academia 6x por semana",
  7: "Futebol é religião",
  8: "Carne mal passada sempre",
  9: "Brother firmeza",
  10: "Respeita as mina",
};

// Frases por RANK (posição no placar) - Divas
const DIVA_PHRASES_BY_RANK: Record<number, string> = {
  1: "Rainha absoluta, periodt",
  2: "Lacrou demais, mana",
  3: "Diva certified",
  4: "Arrasa sempre",
  5: "Glamour é o mínimo",
  6: "Slay queen energy",
  7: "Fabulosa por natureza",
  8: "Brilha mais que glitter",
  9: "Diva em construção",
  10: "Quase lá, querida",
};

// Badges especiais
interface Badge {
  icon: string;
  title: string;
  condition: (percentage: number, time?: number) => boolean;
}

const ALPHA_BADGES: Badge[] = [
  { icon: "🏆", title: "Hetero Raiz", condition: (p) => p < 5 },
  { icon: "💪", title: "Machão Confirmado", condition: (p) => p < 10 },
  { icon: "⚡", title: "Speedrun Alpha", condition: (p, t) => t !== undefined && t < 30 },
  { icon: "🤝", title: "Aliado Confiável", condition: (p) => p >= 40 && p < 50 },
];

// ==================== FUNÇÕES AUXILIARES ====================

function getAlphaTitle(percentage: number): { title: string; emoji: string } {
  const found = ALPHA_TITLES.find(t => percentage >= t.min && percentage <= t.max);
  return found || { title: "Brother Aliado", emoji: "🤝" };
}

function getAlphaPhrase(rank: number): string {
  return ALPHA_PHRASES_BY_RANK[rank] || "Brother gente boa";
}

function getDivaPhrase(rank: number): string {
  return DIVA_PHRASES_BY_RANK[rank] || "Diva em ascensão";
}

function getAlphaBadges(percentage: number, time?: number): Badge[] {
  return ALPHA_BADGES.filter(badge => badge.condition(percentage, time));
}

function getAlphaIcon(position: number): string {
  if (position === 1) return "🗿"; // Chad
  if (position === 2) return "🍺"; // Cerveja
  if (position === 3) return "🔧"; // Chave de boca
  if (position <= 6) return "💪"; // Bíceps
  return "⭐"; // Estrela
}

// ==================== ESTILOS CSS ====================

const animationStyles = `
  @keyframes rotate-gradient {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  
  .rainbow-border {
    position: relative;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(90deg, 
                  #ff0000, #ff7f00, #ffff00, #00ff00, 
                  #00ffff, #0000ff, #8b00ff, #ff00ff,
                  #ff0000) border-box;
    background-size: 200% 100%;
    animation: rotate-gradient 3s linear infinite;
  }
  
  @keyframes orbit-spikes {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .spike-container {
    position: absolute;
    inset: -12px;
    pointer-events: none;
    animation: orbit-spikes 4s linear infinite;
  }
  
  .spike {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 12px solid black;
  }
`;

// Função que retorna classes Tailwind baseadas na porcentagem (34 categorias)
// Nova paleta: Preto → Cinza → Marrom → Azul Escuro → Verde → Ciano → Azul Bebê → Roxo → Vermelho → Rosa → Rosa Choque
function getCategoryBadgeColor(percentage: number): string {
  if (percentage >= 99) return 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white animate-pulse';
  if (percentage >= 96) return 'bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white';
  if (percentage >= 93) return 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white';
  if (percentage >= 90) return 'bg-pink-700 text-white';
  if (percentage >= 87) return 'bg-pink-600 text-white';
  if (percentage >= 84) return 'bg-pink-600 text-white';
  if (percentage >= 81) return 'bg-rose-600 text-white';
  if (percentage >= 78) return 'bg-red-500 text-white';
  if (percentage >= 75) return 'bg-red-600 text-white';
  if (percentage >= 72) return 'bg-fuchsia-600 text-white';
  if (percentage >= 69) return 'bg-purple-700 text-white';
  if (percentage >= 66) return 'bg-purple-600 text-white';
  if (percentage >= 63) return 'bg-purple-500 text-white';
  if (percentage >= 60) return 'bg-violet-600 text-white';
  if (percentage >= 57) return 'bg-violet-600 text-white';
  if (percentage >= 54) return 'bg-blue-500 text-white';
  if (percentage >= 51) return 'bg-sky-600 text-white';
  if (percentage >= 48) return 'bg-sky-600 text-white';
  if (percentage >= 45) return 'bg-cyan-600 text-white';
  if (percentage >= 42) return 'bg-teal-600 text-white';
  if (percentage >= 39) return 'bg-teal-600 text-white';
  if (percentage >= 36) return 'bg-emerald-600 text-white';
  if (percentage >= 33) return 'bg-emerald-700 text-white';
  if (percentage >= 30) return 'bg-emerald-800 text-white';
  if (percentage >= 27) return 'bg-blue-700 text-white';
  if (percentage >= 24) return 'bg-blue-800 text-white';
  if (percentage >= 21) return 'bg-blue-800 text-white';
  if (percentage >= 18) return 'bg-stone-600 text-white';
  if (percentage >= 15) return 'bg-stone-700 text-white';
  if (percentage >= 12) return 'bg-gray-600 text-white';
  if (percentage >= 9) return 'bg-gray-700 text-white';
  if (percentage >= 6) return 'bg-gray-800 text-white';
  if (percentage >= 3) return 'bg-gray-800 text-white';
  return 'bg-black text-white'; // 0%
}

// Função que retorna cor do texto (nome) baseada na porcentagem
function getCategoryTextColor(percentage: number): string {
  if (percentage >= 99) return 'text-pink-600 font-bold';
  if (percentage >= 96) return 'text-fuchsia-600 font-bold';
  if (percentage >= 93) return 'text-pink-600 font-bold';
  if (percentage >= 90) return 'text-pink-800';
  if (percentage >= 87) return 'text-pink-700';
  if (percentage >= 84) return 'text-pink-700';
  if (percentage >= 81) return 'text-rose-700';
  if (percentage >= 78) return 'text-red-600';
  if (percentage >= 75) return 'text-red-700';
  if (percentage >= 72) return 'text-fuchsia-700';
  if (percentage >= 69) return 'text-purple-800';
  if (percentage >= 66) return 'text-purple-700';
  if (percentage >= 63) return 'text-purple-600';
  if (percentage >= 60) return 'text-violet-700';
  if (percentage >= 57) return 'text-violet-700';
  if (percentage >= 54) return 'text-blue-600';
  if (percentage >= 51) return 'text-sky-700';
  if (percentage >= 48) return 'text-sky-700';
  if (percentage >= 45) return 'text-cyan-700';
  if (percentage >= 42) return 'text-teal-700';
  if (percentage >= 39) return 'text-teal-700';
  if (percentage >= 36) return 'text-emerald-700';
  if (percentage >= 33) return 'text-emerald-800';
  if (percentage >= 30) return 'text-emerald-900';
  if (percentage >= 27) return 'text-blue-800';
  if (percentage >= 24) return 'text-blue-900';
  if (percentage >= 21) return 'text-blue-900';
  if (percentage >= 18) return 'text-stone-700';
  if (percentage >= 15) return 'text-stone-800';
  if (percentage >= 12) return 'text-gray-700';
  if (percentage >= 9) return 'text-gray-800';
  if (percentage >= 6) return 'text-gray-900';
  if (percentage >= 3) return 'text-gray-900';
  return 'text-black font-bold'; // 0%
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

interface RankBadgeProps {
  rank: number;
  category: 'divas' | 'alfas';
}

const RankBadge = ({ rank, category }: RankBadgeProps) => {
  // Top 1 Divas - Coroa Rainbow
  if (rank === 1 && category === 'divas') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rainbow1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#FF6B9D', stopOpacity: 1}} />
            <stop offset="50%" style={{stopColor: '#C44EFF', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#4ECAFF', stopOpacity: 1}} />
          </linearGradient>
        </defs>
        <path d="M16 4 L18 12 L26 10 L20 16 L28 20 L18 20 L16 28 L14 20 L4 20 L12 16 L6 10 L14 12 Z" fill="url(#rainbow1)" stroke="#FFD700" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="3" fill="#FFD700"/>
      </svg>
    );
  }
  
  // Top 1 Alfas - Chad (Moai) - TAMANHO PADRONIZADO
  if (rank === 1 && category === 'alfas') {
    return <span className="text-2xl" title="Chad Supremo">🗿</span>;
  }
  
  // Top 2 Divas - Estrela Rosa
  if (rank === 2 && category === 'divas') {
    return (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4 L19 13 L28 13 L21 19 L24 28 L16 22 L8 28 L11 19 L4 13 L13 13 Z" fill="#FF69B4" stroke="#FF1493" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="2" fill="#FFD700"/>
      </svg>
    );
  }
  
  // Top 2 Alfas - Cerveja - TAMANHO PADRONIZADO
  if (rank === 2 && category === 'alfas') {
    return <span className="text-2xl" title="Cerveja Gelada">🍺</span>;
  }
  
  // Top 3 Divas - Diamante Rosa
  if (rank === 3 && category === 'divas') {
    return (
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4 L22 12 L16 28 L10 12 Z" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="1.5"/>
        <path d="M10 12 L16 12 L22 12 L16 20 Z" fill="#FFC0CB" opacity="0.8"/>
      </svg>
    );
  }
  
  // Top 3 Alfas - Chave de Boca - TAMANHO PADRONIZADO
  if (rank === 3 && category === 'alfas') {
    return <span className="text-2xl" title="Chave de Boca">🔧</span>;
  }
  
  // Ranks 4-6 Alfas - Bíceps
  if (rank <= 6 && category === 'alfas') {
    return <span className="text-xl" title="Força">💪</span>;
  }
  
  // Ranks 4-6 Divas - Estrela
  if (rank <= 6 && category === 'divas') {
    return <span className="text-xl">⭐</span>;
  }
  
  // Ranks 7-10 - Estrela pequena
  return <span className="text-lg">⭐</span>;
};

export const Leaderboard = ({ leaderboard, maxItems = 50 }: LeaderboardProps) => {
  // Injetar estilos CSS customizados
  React.useEffect(() => {
    const styleId = 'leaderboard-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = animationStyles;
      document.head.appendChild(style);
    }
  }, []);
  
  if (leaderboard.length === 0) {
    return (
      <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-lg shadow-2xl p-4 sm:p-8 border-2 border-white/30 dark:border-gray-700">
        <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center text-white drop-shadow-lg">
          🏆 Placar de Líderes 🏆
        </h2>
        <p className="text-center text-white/70 text-sm sm:text-base">
          Nenhum resultado ainda. Seja o primeiro!
        </p>
      </div>
    );
  }

  // Separar em Divas (>=50%) e Alfas (<50%)
  const divas = leaderboard
    .filter(entry => entry.percentage >= 50)
    .slice(0, maxItems);
  
  // Alfas ordenados de forma CRESCENTE (menores % primeiro = mais héteros)
  const alfas = leaderboard
    .filter(entry => entry.percentage < 50)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, maxItems);

  const renderEntry = (entry: LeaderEntry, index: number, category: 'divas' | 'alfas') => {
    const rank = index + 1;
    
    // Para Top Alpha, inverter a porcentagem visualmente (0% vira 100%, 100% vira 0%)
    const displayPercentage = category === 'alfas' ? 100 - entry.percentage : entry.percentage;
    
    // ==================== LÓGICA ALPHA E DIVAS ====================
    let customTitle = "";
    let customPhrase = "";
    let alphaBadges: Badge[] = [];
    
    if (category === 'alfas') {
      const titleData = getAlphaTitle(displayPercentage);
      customTitle = titleData.title;
      customPhrase = getAlphaPhrase(rank); // Usa RANK, não percentage
      alphaBadges = getAlphaBadges(entry.percentage, entry.tempo_segundos);
    } else {
      // Divas usam o resultado padrão como título
      customTitle = entry.result;
      customPhrase = getDivaPhrase(rank); // Usa RANK
    }
    
    // Estilos personalizados por colocação
    let bgGradient, borderClass, glowClass, rankColor, specialAnimation = null, cardAnimation = '';
    
    if (rank === 1) {
      bgGradient = 'from-yellow-100 via-yellow-50 to-amber-100 dark:from-black dark:via-gray-900 dark:to-black';
      
      // Animações diferentes para Divas e Alpha
      if (category === 'divas') {
        borderClass = 'border-4 border-transparent rainbow-border';
        glowClass = 'shadow-[0_0_25px_rgba(255,215,0,0.9)]';
      } else {
        borderClass = 'border-4 border-black';
        glowClass = 'shadow-[0_0_25px_rgba(0,0,0,0.9)]';
        // Espinhos orbitando (sempre apontam para fora)
        specialAnimation = (
          <div className="spike-container">
            {/* Topo */}
            <div className="spike" style={{ top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(0deg)' }} />
            {/* Topo-direita */}
            <div className="spike" style={{ top: '10%', right: '10%', transform: 'rotate(45deg)' }} />
            {/* Direita */}
            <div className="spike" style={{ top: '50%', right: '-6px', transform: 'translateY(-50%) rotate(90deg)' }} />
            {/* Baixo-direita */}
            <div className="spike" style={{ bottom: '10%', right: '10%', transform: 'rotate(135deg)' }} />
            {/* Baixo */}
            <div className="spike" style={{ bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(180deg)' }} />
            {/* Baixo-esquerda */}
            <div className="spike" style={{ bottom: '10%', left: '10%', transform: 'rotate(225deg)' }} />
            {/* Esquerda */}
            <div className="spike" style={{ top: '50%', left: '-6px', transform: 'translateY(-50%) rotate(270deg)' }} />
            {/* Topo-esquerda */}
            <div className="spike" style={{ top: '10%', left: '10%', transform: 'rotate(315deg)' }} />
          </div>
        );
      }

      rankColor = 'text-yellow-600 dark:text-yellow-300';
    } else if (rank === 2) {
      bgGradient = 'from-gray-100 via-gray-50 to-slate-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700';
      borderClass = 'border-3 border-gray-300';
      glowClass = 'shadow-[0_0_20px_rgba(192,192,192,0.8)]';
      rankColor = 'text-gray-600 dark:text-gray-300';
    } else if (rank === 3) {
      bgGradient = 'from-orange-100 via-orange-50 to-amber-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700';
      borderClass = 'border-3 border-orange-400';
      glowClass = 'shadow-[0_0_20px_rgba(205,127,50,0.8)]';
      rankColor = 'text-orange-600 dark:text-orange-300';
    } else if (rank <= 6) {
      bgGradient = 'from-pink-200 via-purple-200 to-blue-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700';
      borderClass = 'border-2 border-purple-300';
      glowClass = 'shadow-md';
      rankColor = 'text-purple-600 dark:text-purple-300';
    } else {
      bgGradient = 'from-pink-100 to-purple-100 dark:from-gray-800 dark:to-gray-900';
      borderClass = 'border border-purple-200';
      glowClass = 'shadow-sm';
      rankColor = 'text-purple-500 dark:text-purple-300';
    }
    
    return (
      <div key={`${category}-${index}`} className={`relative flex justify-between items-center p-0.5 sm:p-2 bg-gradient-to-r ${bgGradient} rounded-lg hover:scale-[1.01] transition-all duration-300 ${borderClass} ${glowClass} ${cardAnimation}`}>
        {specialAnimation}
        <div className="flex items-center gap-0.5 sm:gap-2 md:gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-center">
            <span className={`text-[10px] sm:text-sm font-bold ${rankColor}`}>#{rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-[11px] sm:text-base md:text-lg ${getCategoryTextColor(entry.percentage)} ${entry.percentage >= 90 ? 'dark:text-pink-400' : 'dark:text-gray-100'} truncate`}>
              {entry.name}
              {/* Badges Alpha */}
              {category === 'alfas' && alphaBadges.length > 0 && (
                <span className="ml-1">
                  {alphaBadges.map((badge, i) => (
                    <span key={i} className="text-xs" title={badge.title}>{badge.icon}</span>
                  ))}
                </span>
              )}
            </p>
            {/* Título customizado (Alpha ou Diva) */}
            <p className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full inline-block ${getCategoryBadgeColor(entry.percentage)} font-medium truncate max-w-full`}>
              {customTitle}
            </p>
            {/* Frase engraçada (Alpha e Divas) - TEXTO PEQUENO */}
            <p className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 italic truncate">
              "{customPhrase}"
            </p>
            <p className="text-[9px] sm:text-xs text-gray-600 hidden sm:block">
              {entry.date} {entry.tempo_segundos && rank <= 3 ? <span className="font-bold text-purple-600">({entry.tempo_segundos.toFixed(2)}s)</span> : entry.tempo_segundos ? `(${entry.tempo_segundos.toFixed(2)}s)` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <RankBadge rank={rank} category={category} />
          <span className="text-sm sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-300">{displayPercentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div data-leaderboard className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-lg shadow-2xl p-4 sm:p-8 border-2 border-white/30 dark:border-gray-700 max-h-[600px] overflow-y-auto">
      <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center text-white drop-shadow-lg">
        🏆 Placar de Líderes 🏆
      </h2>
      
      {/* Grid 2 colunas SEMPRE (mobile e desktop) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
        {/* Top Divas */}
        <div className="flex flex-col">
          <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-center text-pink-600 drop-shadow-lg">
            👑 Top Divas
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-transparent">
            {divas.length > 0 ? (
              divas.map((entry, index) => renderEntry(entry, index, 'divas'))
            ) : (
              <p className="text-center text-white/70 text-sm">Nenhuma diva ainda!</p>
            )}
          </div>
        </div>

        {/* Top Alfas */}
        <div className="flex flex-col">
          <h3 className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-center text-black drop-shadow-lg">
            💪 Top Alpha
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {alfas.length > 0 ? (
              alfas.map((entry, index) => renderEntry(entry, index, 'alfas'))
            ) : (
              <p className="text-center text-white/70 text-sm">Nenhum alpha ainda!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
