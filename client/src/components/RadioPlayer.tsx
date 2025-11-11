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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Play/Pause + Nome */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Botão Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-purple-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Nome da Rádio */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg truncate flex items-center gap-2">
              {isPlaying && (
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
                </span>
              )}
              {stationName}
            </p>
            <p className="text-white/80 text-sm">
              {isPlaying ? "Ao vivo" : "Parado"}
            </p>
          </div>
        </div>

        {/* Lado Direito: Controle de Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="text-white hover:scale-110 transition-transform p-2"
            title="Volume"
          >
            {volume === 0 ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume < 50 ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 9v6h4l5 5V4l-5 5H7z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          {/* Slider de Volume */}
          {showVolumeSlider && (
            <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-full px-3 py-2 backdrop-blur-sm">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-white text-sm font-bold w-8 text-right">
                {volume}
              </span>
            </div>
          )}

          {/* Botão Chat - Grande e Chamativo */}
          <button
            onClick={() => {
              // Disparar evento para abrir o chat
              window.dispatchEvent(new CustomEvent('toggleChat'));
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-white font-bold text-base animate-pulse-slow relative overflow-hidden"
            title="Chat Global"
            style={{
              animation: "gradient-shift 3s ease infinite, pulse-glow 2s ease-in-out infinite",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 20px rgba(236, 72, 153, 0.6), 0 0 30px rgba(168, 85, 247, 0.4)"
            }}
          >
            <span className="text-xl">💬</span>
            <span className="hidden sm:inline">Chat</span>
          </button>
        </div>
      </div>

      {/* Controle de Volume Mobile (Dropdown) */}
      {showVolumeSlider && (
        <div className="md:hidden bg-white/10 backdrop-blur-sm px-4 py-3 border-t border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-bold">Volume:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1 h-2 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-white text-sm font-bold w-10 text-right">
              {volume}%
            </span>
          </div>
        </div>
      )}

      {/* Animações CSS Customizadas */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.6), 0 0 30px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(236, 72, 153, 0.9), 0 0 50px rgba(168, 85, 247, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
