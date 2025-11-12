import { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";

interface Song {
  title: string;
  artist: string;
}

interface RadioContextType {
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  currentSong: Song | null;
  totalSongs: number;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [totalSongs, setTotalSongs] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar volume salvo do localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("radio_volume");
    if (savedVolume) {
      setVolumeState(parseInt(savedVolume));
    }
  }, []);

  // Inicializar o áudio com o stream do servidor
  useEffect(() => {
    // Cria o elemento de áudio apontando para o stream
    const streamUrl = '/api/radio/stream';
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = volume / 100;
    audioRef.current.preload = "none"; // Não pré-carregar, pois é um stream

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

    audioRef.current.addEventListener("error", (e) => {
      setIsLoading(false);
      setIsPlaying(false);
      console.error('Erro ao carregar stream de rádio:', e);
    });

    // Cleanup
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

  // Buscar informações da música atual periodicamente
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/radio/nowplaying');
        if (response.ok) {
          const data = await response.json();
          setCurrentSong({
            title: data.title,
            artist: data.artist
          });
          setTotalSongs(data.total);
        }
      } catch (error) {
        console.error('Erro ao buscar informações da música:', error);
      }
    };

    // Busca imediatamente
    fetchNowPlaying();

    // Atualiza a cada 10 segundos
    const interval = setInterval(fetchNowPlaying, 10000);

    return () => clearInterval(interval);
  }, []);

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
        currentSong,
        totalSongs,
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
