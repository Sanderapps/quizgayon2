/**
 * Hook customizado para Easter Eggs
 * Otimizado para mobile com suporte a touch events
 */

import { useEffect, useState, useCallback } from "react";

export interface EasterEggState {
  konamiActive: boolean;
  rainbowMode: boolean;
  discoMode: boolean;
  prideMode: boolean;
  blackScreenMode: boolean;
  secretMessage: string | null;
}

export function useEasterEggs() {
  const [state, setState] = useState<EasterEggState>({
    konamiActive: false,
    rainbowMode: false,
    discoMode: false,
    prideMode: false,
    blackScreenMode: false,
    secretMessage: null,
  });

  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeSequence, setSwipeSequence] = useState<string[]>([]);

  // Sequência do Konami Code adaptada para swipes mobile
  // ↑↑↓↓←→←→ = up, up, down, down, left, right, left, right
  const KONAMI_CODE = ["up", "up", "down", "down", "left", "right", "left", "right"];

  // ==================== KONAMI CODE (SWIPE MOBILE) ====================
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartY === null || touchStartX === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;

    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;

    // Detectar direção do swipe (mínimo 50px)
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
      // Swipe vertical
      const direction = diffY > 0 ? "up" : "down";
      setSwipeSequence((prev) => [...prev, direction].slice(-8));
    } else if (Math.abs(diffX) > 50) {
      // Swipe horizontal
      const direction = diffX > 0 ? "left" : "right";
      setSwipeSequence((prev) => [...prev, direction].slice(-8));
    }

    setTouchStartY(null);
    setTouchStartX(null);
  }, [touchStartY, touchStartX]);

  // Verificar se a sequência Konami foi completada
  useEffect(() => {
    if (swipeSequence.length === 8) {
      const isKonami = swipeSequence.every((dir, i) => dir === KONAMI_CODE[i]);
      if (isKonami && !state.konamiActive) {
        setState((prev) => ({ ...prev, konamiActive: true, rainbowMode: true }));
        setSwipeSequence([]);
        
        // Desativar após 10 segundos
        setTimeout(() => {
          setState((prev) => ({ ...prev, konamiActive: false }));
        }, 10000);
      }
    }
  }, [swipeSequence, state.konamiActive]);

  // ==================== HORA DO DIA ====================
  
  useEffect(() => {
    const checkTimeEasterEgg = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // 00:00 - Meia-noite
      if (hours === 0 && minutes === 0) {
        setState((prev) => ({ ...prev, secretMessage: "🌙 After Hours Mode Ativado!" }));
        setTimeout(() => setState((prev) => ({ ...prev, secretMessage: null })), 5000);
      }

      // 04:20
      if (hours === 4 && minutes === 20) {
        setState((prev) => ({ ...prev, secretMessage: "🌿 Nice timing!" }));
        setTimeout(() => setState((prev) => ({ ...prev, secretMessage: null })), 5000);
      }

      // 13:37 - Leet
      if (hours === 13 && minutes === 37) {
        setState((prev) => ({ ...prev, secretMessage: "💻 1337 H4X0R M0D3!" }));
        setTimeout(() => setState((prev) => ({ ...prev, secretMessage: null })), 5000);
      }
    };

    // Verificar a cada minuto
    const interval = setInterval(checkTimeEasterEgg, 60000);
    checkTimeEasterEgg(); // Verificar imediatamente

    return () => clearInterval(interval);
  }, []);

  // ==================== LISTENERS ====================
  
  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  // ==================== FUNÇÕES PÚBLICAS ====================

  const activateBlackScreen = useCallback(() => {
    setState((prev) => ({ ...prev, blackScreenMode: true }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, blackScreenMode: false }));
    }, 3000);
  }, []);

  const activatePrideMode = useCallback(() => {
    setState((prev) => ({ ...prev, prideMode: !prev.prideMode }));
  }, []);

  const activateDiscoMode = useCallback(() => {
    setState((prev) => ({ ...prev, discoMode: true }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, discoMode: false }));
    }, 5000);
  }, []);

  const showSecretMessage = useCallback((message: string, duration: number = 3000) => {
    setState((prev) => ({ ...prev, secretMessage: message }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, secretMessage: null }));
    }, duration);
  }, []);

  return {
    ...state,
    activateBlackScreen,
    activatePrideMode,
    activateDiscoMode,
    showSecretMessage,
  };
}
