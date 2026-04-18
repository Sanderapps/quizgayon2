/**
 * Componente de Efeitos Visuais para Easter Eggs
 * Renderiza os efeitos visuais ativados pelos easter eggs
 */

import { useEffect, useState } from "react";

export interface EasterEggState {
  konamiActive: boolean;
  secretMessage: string | null;
  blackScreenMode: boolean;
  rainbowMode: boolean;
  prideMode: boolean;
  discoMode: boolean;
}

interface EasterEggEffectsProps {
  state: EasterEggState;
}

export function EasterEggEffects({ state }: EasterEggEffectsProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  // Gerar confete quando Konami Code é ativado
  useEffect(() => {
    if (state.konamiActive) {
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setConfetti(newConfetti);

      setTimeout(() => setConfetti([]), 10000);
    }
  }, [state.konamiActive]);

  return (
    <>
      {/* Mensagem Secreta */}
      {state.secretMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-black/90 text-white px-8 py-4 rounded-2xl text-2xl font-bold animate-bounce shadow-2xl">
          {state.secretMessage}
        </div>
      )}

      {/* Tela Preta (0 pontos) */}
      {state.blackScreenMode && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in">
          <div className="text-center space-y-4 animate-pulse">
            <p className="text-6xl">💀</p>
            <p className="text-white text-2xl font-bold">Não foi dessa vez...</p>
            <p className="text-gray-400 text-lg">Mas você pode tentar de novo! 💪</p>
          </div>
        </div>
      )}

      {/* Modo Arco-Íris (Konami Code) */}
      {state.rainbowMode && (
        <div className="fixed inset-0 z-[90] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-30 animate-rainbow-spin" />
          
          {/* Confete */}
          {confetti.map((item) => (
            <div
              key={item.id}
              className="absolute top-0 w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${item.left}%`,
                animationDelay: `${item.delay}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modo Pride (3 cliques no tema) */}
      {state.prideMode && (
        <div className="fixed top-0 left-0 right-0 h-2 z-[100] bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
      )}

      {/* Modo Disco (10 cliques no logo) */}
      {state.discoMode && (
        <div className="fixed inset-0 z-[90] pointer-events-none">
          <div className="absolute inset-0 animate-disco-lights" />
        </div>
      )}

      {/* Animações CSS */}
      <style>{`
        @keyframes rainbow-spin {
          0% { transform: rotate(0deg) scale(1.5); }
          100% { transform: rotate(360deg) scale(1.5); }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes disco-lights {
          0% { background: rgba(255, 0, 0, 0.3); }
          14% { background: rgba(255, 127, 0, 0.3); }
          28% { background: rgba(255, 255, 0, 0.3); }
          42% { background: rgba(0, 255, 0, 0.3); }
          57% { background: rgba(0, 0, 255, 0.3); }
          71% { background: rgba(75, 0, 130, 0.3); }
          85% { background: rgba(148, 0, 211, 0.3); }
          100% { background: rgba(255, 0, 0, 0.3); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-rainbow-spin {
          animation: rainbow-spin 10s linear infinite;
        }

        .animate-confetti {
          animation: confetti 3s ease-in forwards;
        }

        .animate-disco-lights {
          animation: disco-lights 0.5s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
