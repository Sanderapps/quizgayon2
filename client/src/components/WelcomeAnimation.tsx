import { useState, useEffect } from "react";

export function WelcomeAnimation() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Verificar se já viu a animação
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    
    if (!hasSeenWelcome) {
      setShow(true);
      
      // Sequência de animação
      setTimeout(() => setStep(1), 500);
      setTimeout(() => setStep(2), 1500);
      setTimeout(() => setStep(3), 2500);
      setTimeout(() => {
        setShow(false);
        localStorage.setItem("hasSeenWelcome", "true");
      }, 4000);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 animate-gradient">
      <div className="text-center">
        {/* Passo 1: Emoji grande */}
        {step >= 0 && (
          <div
            className={`text-9xl mb-8 transition-all duration-1000 ${
              step >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            🌈
          </div>
        )}

        {/* Passo 2: Título */}
        {step >= 1 && (
          <h1
            className={`text-6xl font-bold text-white mb-4 transition-all duration-1000 ${
              step >= 2 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            Quiz Gayôn
          </h1>
        )}

        {/* Passo 3: Subtítulo */}
        {step >= 2 && (
          <p
            className={`text-2xl text-white/90 transition-all duration-1000 ${
              step >= 3 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            Descubra seu lado arco-íris! ✨
          </p>
        )}

        {/* Passo 4: Loading dots */}
        {step >= 3 && (
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
