import { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";

interface RadioContextType {
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar volume salvo do localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("radio_volume");
    if (savedVolume) {
      setVolumeState(parseInt(savedVolume));
    }
  }, []);

  // Inicializar o áudio uma única vez
  useEffect(() => {
    const streamUrl = "https://stream.zeno.fm/f3wvbbqmdg8uv";
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

    audioRef.current.addEventListener("pause", () => {
      setIsPlaying(false);
      setIsLoading(false);
    });

    audioRef.current.addEventListener("error", () => {
      setIsLoading(false);
      setIsPlaying(false);
    });

    // Cleanup ao desmontar o provider (nunca acontece na prática)
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Atualizar volume quando mudar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      localStorage.setItem("radio_volume", volume.toString());
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      audioRef.current.play().catch((error) => {
        console.error("Erro ao reproduzir:", error);
        setIsLoading(false);
      });
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  return (
    <RadioContext.Provider
      value={{
        isPlaying,
        volume,
        isLoading,
        togglePlay,
        setVolume,
        audioRef,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error("useRadio must be used within a RadioProvider");
  }
  return context;
}
