interface RankBadgeProps {
  rank: number;
  category?: 'divas' | 'alfas';
}

export const RankBadge = ({ rank, category = 'divas' }: RankBadgeProps) => {
  // Top 3 são iguais para ambas categorias
  
  // 1º lugar - Coroa Dourada
  if (rank === 1) {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFD700' }} />
            <stop offset="50%" style={{ stopColor: '#FFA500' }} />
            <stop offset="100%" style={{ stopColor: '#FF8C00' }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M20 5 L23 12 L30 13 L25 18 L26 25 L20 21 L14 25 L15 18 L10 13 L17 12 Z" 
              fill="url(#gold)" stroke="#B8860B" strokeWidth="1" filter="url(#glow)"/>
        <circle cx="20" cy="20" r="6" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
        <path d="M16 18 L18 22 L20 18 L22 22 L24 18" stroke="#FF8C00" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }

  // 2º lugar - Estrela Prateada com Brilho
  if (rank === 2) {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#F0F0F0' }} />
            <stop offset="30%" style={{ stopColor: '#E0E0E0' }} />
            <stop offset="60%" style={{ stopColor: '#C0C0C0' }} />
            <stop offset="100%" style={{ stopColor: '#B0B0B0' }} />
          </linearGradient>
          <radialGradient id="silverGlow">
            <stop offset="0%" style={{ stopColor: '#FFF', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#C0C0C0', stopOpacity: 0 }} />
          </radialGradient>
          <filter id="silverShadow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Glow de fundo */}
        <circle cx="20" cy="20" r="18" fill="url(#silverGlow)" opacity="0.3"/>
        {/* Estrela principal */}
        <path d="M20 6 L23 15 L32 15 L25 21 L28 30 L20 24 L12 30 L15 21 L8 15 L17 15 Z" 
              fill="url(#silver)" stroke="#909090" strokeWidth="1.5" filter="url(#silverShadow)"/>
        {/* Brilhos internos */}
        <circle cx="20" cy="18" r="4" fill="#FFF" opacity="0.6"/>
        <circle cx="18" cy="16" r="2" fill="#FFF" opacity="0.8"/>
        <circle cx="22" cy="19" r="1.5" fill="#FFF" opacity="0.9"/>
        {/* Detalhes de cristal */}
        <path d="M20 10 L21 14 L20 18 L19 14 Z" fill="#FFF" opacity="0.4"/>
        <path d="M14 18 L18 19 L20 20 L16 21 Z" fill="#FFF" opacity="0.3"/>
        <path d="M26 18 L22 19 L20 20 L24 21 Z" fill="#FFF" opacity="0.3"/>
      </svg>
    );
  }

  // 3º lugar - Troféu Bronze
  if (rank === 3) {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="bronze" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#CD7F32' }} />
            <stop offset="50%" style={{ stopColor: '#B87333' }} />
            <stop offset="100%" style={{ stopColor: '#8B4513' }} />
          </linearGradient>
        </defs>
        <ellipse cx="20" cy="15" rx="8" ry="6" fill="url(#bronze)" stroke="#8B4513" strokeWidth="1"/>
        <rect x="18" y="20" width="4" height="8" fill="url(#bronze)" stroke="#8B4513" strokeWidth="1"/>
        <rect x="14" y="28" width="12" height="3" rx="1" fill="url(#bronze)" stroke="#8B4513" strokeWidth="1"/>
        <path d="M12 15 Q10 10 8 12" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
        <path d="M28 15 Q30 10 32 12" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }

  // 4º-10º lugar - Diferentes para Divas e Alfas
  if (category === 'divas') {
    // Insígnias Divas (originais)
    if (rank === 4) return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 6 L17 12 L23 12 L18 16 L20 22 L15 18 L10 22 L12 16 L7 12 L13 12 Z" 
              fill="#9333EA" stroke="#7C3AED" strokeWidth="1"/>
      </svg>
    );
    if (rank === 5) return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 25 C15 25 5 18 5 11 C5 7 8 5 11 5 C13 5 15 7 15 7 C15 7 17 5 19 5 C22 5 25 7 25 11 C25 18 15 25 15 25 Z" 
              fill="#EC4899" stroke="#DB2777" strokeWidth="1"/>
      </svg>
    );
    if (rank === 6) return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M5 20 Q15 5 25 20" stroke="#FF0000" strokeWidth="2" fill="none"/>
        <path d="M6 20 Q15 7 24 20" stroke="#FFA500" strokeWidth="2" fill="none"/>
        <path d="M7 20 Q15 9 23 20" stroke="#FFFF00" strokeWidth="2" fill="none"/>
        <path d="M8 20 Q15 11 22 20" stroke="#00FF00" strokeWidth="2" fill="none"/>
        <path d="M9 20 Q15 13 21 20" stroke="#0000FF" strokeWidth="2" fill="none"/>
        <path d="M10 20 Q15 15 20 20" stroke="#8B00FF" strokeWidth="2" fill="none"/>
      </svg>
    );
    if (rank === 7) return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="flame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#C084FC' }} />
            <stop offset="100%" style={{ stopColor: '#9333EA' }} />
          </linearGradient>
        </defs>
        <path d="M15 5 Q18 10 17 15 Q20 18 18 22 Q17 25 15 25 Q13 25 12 22 Q10 18 13 15 Q12 10 15 5 Z" 
              fill="url(#flame)" stroke="#7C3AED" strokeWidth="1"/>
      </svg>
    );
    if (rank === 8) return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="diamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60A5FA' }} />
            <stop offset="100%" style={{ stopColor: '#3B82F6' }} />
          </linearGradient>
        </defs>
        <path d="M15 5 L22 12 L15 25 L8 12 Z" fill="url(#diamond)" stroke="#2563EB" strokeWidth="1"/>
        <path d="M15 5 L15 25 M8 12 L22 12" stroke="#93C5FD" strokeWidth="0.5" opacity="0.5"/>
      </svg>
    );
    if (rank === 9) return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <ellipse cx="10" cy="12" rx="5" ry="7" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
        <ellipse cx="20" cy="12" rx="5" ry="7" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
        <ellipse cx="10" cy="20" rx="4" ry="5" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1"/>
        <ellipse cx="20" cy="20" rx="4" ry="5" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1"/>
        <line x1="15" y1="8" x2="15" y2="24" stroke="#BE185D" strokeWidth="2"/>
      </svg>
    );
    if (rank === 10) return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="10" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="20" cy="15" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="15" cy="20" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="10" cy="15" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="15" cy="15" r="2.5" fill="#F59E0B"/>
      </svg>
    );
  } else {
    // Insígnias Alfas (masculinas)
    if (rank === 4) return ( // Leão
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="lion" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#F59E0B' }} />
            <stop offset="100%" style={{ stopColor: '#D97706' }} />
          </linearGradient>
        </defs>
        <circle cx="15" cy="15" r="10" fill="url(#lion)" stroke="#B45309" strokeWidth="1"/>
        <circle cx="12" cy="13" r="1.5" fill="#000"/>
        <circle cx="18" cy="13" r="1.5" fill="#000"/>
        <path d="M12 18 Q15 20 18 18" stroke="#000" strokeWidth="1.5" fill="none"/>
        {/* Juba */}
        <circle cx="8" cy="10" r="2" fill="#F59E0B"/>
        <circle cx="22" cy="10" r="2" fill="#F59E0B"/>
        <circle cx="6" cy="15" r="2" fill="#F59E0B"/>
        <circle cx="24" cy="15" r="2" fill="#F59E0B"/>
        <circle cx="8" cy="20" r="2" fill="#F59E0B"/>
        <circle cx="22" cy="20" r="2" fill="#F59E0B"/>
      </svg>
    );
    if (rank === 5) return ( // Fogo
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="fire" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#EF4444' }} />
            <stop offset="100%" style={{ stopColor: '#DC2626' }} />
          </linearGradient>
        </defs>
        <path d="M15 5 Q18 10 17 15 Q20 18 18 23 Q17 26 15 26 Q13 26 12 23 Q10 18 13 15 Q12 10 15 5 Z" 
              fill="url(#fire)" stroke="#B91C1C" strokeWidth="1"/>
        <path d="M15 10 Q16 13 15.5 16 Q17 18 16 21 Q15.5 23 15 23 Q14.5 23 14 21 Q13 18 14.5 16 Q14 13 15 10 Z" 
              fill="#FBBF24" opacity="0.7"/>
      </svg>
    );
    if (rank === 6) return ( // Raio
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="lightning" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FBBF24' }} />
            <stop offset="100%" style={{ stopColor: '#F59E0B' }} />
          </linearGradient>
        </defs>
        <path d="M18 5 L10 15 L15 15 L12 25 L22 13 L17 13 Z" 
              fill="url(#lightning)" stroke="#D97706" strokeWidth="1"/>
      </svg>
    );
    if (rank === 7) return ( // Escudo
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
            <stop offset="100%" style={{ stopColor: '#2563EB' }} />
          </linearGradient>
        </defs>
        <path d="M15 5 L25 10 L25 18 Q25 25 15 28 Q5 25 5 18 L5 10 Z" 
              fill="url(#shield)" stroke="#1D4ED8" strokeWidth="1"/>
        <path d="M15 8 L20 11 L20 17 Q20 21 15 23 Q10 21 10 17 L10 11 Z" 
              fill="#60A5FA" opacity="0.5"/>
      </svg>
    );
    if (rank === 8) return ( // Espada
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="sword" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#9CA3AF' }} />
            <stop offset="100%" style={{ stopColor: '#6B7280' }} />
          </linearGradient>
        </defs>
        <rect x="13" y="5" width="4" height="15" fill="url(#sword)" stroke="#4B5563" strokeWidth="1"/>
        <rect x="11" y="20" width="8" height="2" fill="#8B4513"/>
        <rect x="10" y="22" width="10" height="3" rx="1" fill="#8B4513"/>
        <path d="M13 5 L17 5 L16 3 L14 3 Z" fill="#9CA3AF"/>
      </svg>
    );
    if (rank === 9) return ( // Montanha
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="mountain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#78716C' }} />
            <stop offset="100%" style={{ stopColor: '#57534E' }} />
          </linearGradient>
        </defs>
        <path d="M15 6 L25 24 L5 24 Z" fill="url(#mountain)" stroke="#44403C" strokeWidth="1"/>
        <path d="M15 6 L20 15 L15 12 L10 15 Z" fill="#A8A29E" opacity="0.5"/>
      </svg>
    );
    if (rank === 10) return ( // Âncora
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <defs>
          <linearGradient id="anchor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#64748B' }} />
            <stop offset="100%" style={{ stopColor: '#475569' }} />
          </linearGradient>
        </defs>
        <circle cx="15" cy="8" r="3" fill="none" stroke="url(#anchor)" strokeWidth="1.5"/>
        <line x1="15" y1="11" x2="15" y2="22" stroke="url(#anchor)" strokeWidth="2"/>
        <path d="M10 18 L8 22 Q8 24 10 24" stroke="url(#anchor)" strokeWidth="1.5" fill="none"/>
        <path d="M20 18 L22 22 Q22 24 20 24" stroke="url(#anchor)" strokeWidth="1.5" fill="none"/>
        <line x1="10" y1="15" x2="20" y2="15" stroke="url(#anchor)" strokeWidth="1.5"/>
      </svg>
    );
  }

  // 11º e 12º lugar - Sem insígnia
  return null;
};
