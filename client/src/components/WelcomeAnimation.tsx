import { useState, useEffect } from "react";

export function WelcomeAnimation() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShow(true);
      setTimeout(() => setStep(1), 500);
      setTimeout(() => setStep(2), 1200);
      setTimeout(() => setStep(3), 2000);
      setTimeout(() => {
        setShow(false);
        localStorage.setItem("hasSeenWelcome", "true");
      }, 3500);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#06060e]">
      {/* Ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center">
        {/* Logo */}
        <div
          className={`orbitron text-5xl md:text-6xl font-black mb-4 transition-all duration-700 ${
            step >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <span className="text-white">Qui</span>
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Zoeira</span>
        </div>

        {/* Subtitle */}
        <p
          className={`text-lg text-gray-400 transition-all duration-700 ${
            step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          ArenaQuiz — Descubra, Responda, Domine
        </p>

        {/* Loading dots */}
        {step >= 3 && (
          <div className="mt-8 flex justify-center gap-2">
            {[0, 150, 300].map((delay) => (
              <div key={delay} className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
