/**
 * Easter Eggs específicos da página Home
 * Gerencia easter eggs relacionados ao quiz, placar e rodapé
 */

import { useEffect, useState, useRef } from "react";

interface HomeEasterEggsProps {
  playerName: string;
  totalPoints: number;
  onSecretName: (message: string) => void;
  onSpecialScore: (score: number) => void;
}

export function HomeEasterEggs({
  playerName,
  totalPoints,
  onSecretName,
  onSpecialScore,
}: HomeEasterEggsProps) {
  const [footerHoverTime, setFooterHoverTime] = useState(0);
  const [secretMessageShown, setSecretMessageShown] = useState(false);
  const footerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== NOMES SECRETOS ====================
  
  useEffect(() => {
    const normalizedName = playerName.toLowerCase().trim();

    if (normalizedName === "sandev") {
      onSecretName("👨‍💻 Olá, criador! Obrigado por fazer este quiz incrível! 💖");
    } else if (normalizedName === "guardian" || normalizedName.startsWith("guardian-")) {
      onSecretName("🛡️ Ah, o lendário Guardian! Você é famoso por aqui... 😏");
    } else if (normalizedName === "admin") {
      onSecretName("🚫 ACESSO NEGADO! Você não é o admin de verdade... ou é? 🤔");
    } else if (normalizedName === "manus") {
      onSecretName("🤖 Olá! Eu sou a IA que ajudou a criar este projeto! 🎉");
    }
  }, [playerName, onSecretName]);

  // ==================== PONTUAÇÕES ESPECIAIS ====================
  
  useEffect(() => {
    if (totalPoints === 69) {
      onSpecialScore(69);
    } else if (totalPoints === 0) {
      onSpecialScore(0);
    } else if (totalPoints === 60) {
      onSpecialScore(60);
    }
  }, [totalPoints, onSpecialScore]);

  // ==================== HOVER NO RODAPÉ ====================
  
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const handleMouseEnter = () => {
      footerTimerRef.current = setTimeout(() => {
        if (!secretMessageShown) {
          onSecretName("🌈 Você encontrou o segredo do rodapé! Você é curioso(a)! 🔍");
          setSecretMessageShown(true);
        }
      }, 5000);
    };

    const handleMouseLeave = () => {
      if (footerTimerRef.current) {
        clearTimeout(footerTimerRef.current);
        footerTimerRef.current = null;
      }
    };

    // Para mobile: usar touchstart/touchend
    const handleTouchStart = () => {
      footerTimerRef.current = setTimeout(() => {
        if (!secretMessageShown) {
          onSecretName("🌈 Você encontrou o segredo do rodapé! Você é curioso(a)! 🔍");
          setSecretMessageShown(true);
        }
      }, 5000);
    };

    const handleTouchEnd = () => {
      if (footerTimerRef.current) {
        clearTimeout(footerTimerRef.current);
        footerTimerRef.current = null;
      }
    };

    footer.addEventListener("mouseenter", handleMouseEnter);
    footer.addEventListener("mouseleave", handleMouseLeave);
    footer.addEventListener("touchstart", handleTouchStart);
    footer.addEventListener("touchend", handleTouchEnd);

    return () => {
      footer.removeEventListener("mouseenter", handleMouseEnter);
      footer.removeEventListener("mouseleave", handleMouseLeave);
      footer.removeEventListener("touchstart", handleTouchStart);
      footer.removeEventListener("touchend", handleTouchEnd);
      if (footerTimerRef.current) {
        clearTimeout(footerTimerRef.current);
      }
    };
  }, [onSecretName, secretMessageShown]);

  return null; // Este componente não renderiza nada visualmente
}

// ==================== LEADERBOARD SCROLL EASTER EGG ====================

export function LeaderboardEasterEgg({ onReachEnd }: { onReachEnd: () => void }) {
  const [endReached, setEndReached] = useState(false);

  useEffect(() => {
    const leaderboard = document.querySelector('[data-leaderboard]');
    if (!leaderboard) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = leaderboard;
      
      // Verificar se chegou ao final (com margem de 10px)
      if (scrollTop + clientHeight >= scrollHeight - 10 && !endReached) {
        setEndReached(true);
        onReachEnd();
      }
    };

    leaderboard.addEventListener("scroll", handleScroll);

    return () => {
      leaderboard.removeEventListener("scroll", handleScroll);
    };
  }, [onReachEnd, endReached]);

  return null;
}
