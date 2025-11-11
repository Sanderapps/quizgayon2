import { useState, useRef, useEffect } from "react";

interface RadioPlayerProps {
  streamUrl?: string;
  stationName?: string;
}

export function RadioPlayer({ 
  streamUrl = "https://stream.zeno.fm/f3wvbbqmdg8uv", // Exemplo: rádio LGBTQ+ (substituir pela URL desejada)
  stationName = "Rádio QuizGayon 🌈"
}: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar estado salvo do localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("radio_volume");
    if (savedVolume) {
      setVolume(parseInt(savedVolume));
    }
  }, []);

  // Inicializar o áudio
  useEffect(() => {
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = volume / 100;
    audioRef.current.preload = "none";

    // Eventos do áudio
    audioRef.current.addEventListener("playing", () => {
      setIsLoading(false);
      setIsPlaying(true);
    });

    audioRef.current.addEventListener("waiting", () => {
      setIsLoading(true);
    });

    audioRef.current.addEventListener("error", () => {
      setIsLoading(false);
      setIsPlaying(false);
      alert("Erro ao carregar a rádio. Verifique a conexão.");
    });

    // Autoplay ao carregar
    const attemptAutoplay = async () => {
      try {
        setIsLoading(true);
        await audioRef.current?.play();
      } catch (error) {
        // Autoplay bloqueado pelo navegador - usuário precisa interagir primeiro
        console.log("Autoplay bloqueado. Clique no botão play para iniciar.");
        setIsLoading(false);
      }
    };
    
    attemptAutoplay();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [streamUrl]);

  // Atualizar volume do áudio quando o estado mudar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      localStorage.setItem("radio_volume", volume.toString());
    }
  }, [volume]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Erro ao reproduzir:", error);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9997] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-2xl border-t-2 border-white/20">
      {/* Container principal com padding reduzido em mobile */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 md:py-2 flex items-center justify-between gap-4 relative">
        {/* Lado Esquerdo: Play/Pause + Nome */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {/* Botão Play/Pause - menor em mobile */}
          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isLoading ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Nome da Rádio - texto menor em mobile */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base md:text-lg truncate flex items-center gap-1 md:gap-2">
              {isPlaying && (
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-2 md:h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1 h-3 md:h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 h-2 md:h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
                </span>
              )}
              {stationName}
            </p>
            <p className="text-white/80 text-xs md:text-sm">
              {isPlaying ? "Ao vivo" : "Parado"}
            </p>
          </div>
        </div>

        {/* Lado Direito: Botão Chat FLUTUANTE PRA CIMA */}
        <div className="absolute right-4 top-0 -translate-y-1/2">
          <button
            onClick={() => {
              // Disparar evento para abrir o chat
              window.dispatchEvent(new CustomEvent('toggleChat'));
            }}
            className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] hover:scale-110 active:scale-95 transition-all flex items-center gap-2 md:gap-3 text-white font-black text-lg md:text-xl relative overflow-hidden"
            title="Chat Global"
            style={{
              animation: "gradient-shift 3s ease infinite, pulse-glow 2s ease-in-out infinite, bounce-subtle 1.5s ease-in-out infinite",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 30px rgba(236, 72, 153, 0.8), 0 0 50px rgba(168, 85, 247, 0.6), 0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <span className="text-2xl md:text-3xl animate-pulse">💬</span>
            <span className="text-base md:text-xl">Chat</span>
          </button>
        </div>
      </div>

      {/* Animações CSS Customizadas */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 0 50px rgba(168, 85, 247, 0.6); }
          50% { box-shadow: 0 0 40px rgba(236, 72, 153, 1), 0 0 70px rgba(168, 85, 247, 0.9); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
