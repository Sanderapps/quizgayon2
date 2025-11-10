interface RankBadgeProps {
  rank: number;
}

export const RankBadge = ({ rank }: RankBadgeProps) => {
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

  // 4º lugar - Estrela Roxa
  if (rank === 4) {
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 6 L17 12 L23 12 L18 16 L20 22 L15 18 L10 22 L12 16 L7 12 L13 12 Z" 
              fill="#9333EA" stroke="#7C3AED" strokeWidth="1"/>
      </svg>
    );
  }

  // 5º lugar - Coração Rosa
  if (rank === 5) {
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 25 C15 25 5 18 5 11 C5 7 8 5 11 5 C13 5 15 7 15 7 C15 7 17 5 19 5 C22 5 25 7 25 11 C25 18 15 25 15 25 Z" 
              fill="#EC4899" stroke="#DB2777" strokeWidth="1"/>
      </svg>
    );
  }

  // 6º lugar - Arco-íris Mini
  if (rank === 6) {
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M5 20 Q15 5 25 20" stroke="#FF0000" strokeWidth="2" fill="none"/>
        <path d="M6 20 Q15 7 24 20" stroke="#FFA500" strokeWidth="2" fill="none"/>
        <path d="M7 20 Q15 9 23 20" stroke="#FFFF00" strokeWidth="2" fill="none"/>
        <path d="M8 20 Q15 11 22 20" stroke="#00FF00" strokeWidth="2" fill="none"/>
        <path d="M9 20 Q15 13 21 20" stroke="#0000FF" strokeWidth="2" fill="none"/>
        <path d="M10 20 Q15 15 20 20" stroke="#8B00FF" strokeWidth="2" fill="none"/>
      </svg>
    );
  }

  // 7º lugar - Chama Lilás
  if (rank === 7) {
    return (
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
  }

  // 8º lugar - Diamante
  if (rank === 8) {
    return (
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
  }

  // 9º lugar - Borboleta
  if (rank === 9) {
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <ellipse cx="10" cy="12" rx="5" ry="7" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
        <ellipse cx="20" cy="12" rx="5" ry="7" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
        <ellipse cx="10" cy="20" rx="4" ry="5" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1"/>
        <ellipse cx="20" cy="20" rx="4" ry="5" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1"/>
        <line x1="15" y1="8" x2="15" y2="24" stroke="#BE185D" strokeWidth="2"/>
      </svg>
    );
  }

  // 10º lugar - Flor
  if (rank === 10) {
    return (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="10" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="20" cy="15" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="15" cy="20" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="10" cy="15" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
        <circle cx="15" cy="15" r="2.5" fill="#F59E0B"/>
      </svg>
    );
  }

  // 11º e 12º lugar - Sem insígnia
  if (rank > 10) {
    return null;
  }

  return null;
};
