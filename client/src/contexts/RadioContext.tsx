import { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";

interface Song {
  file: string;
  title: string;
  artist: string;
}

interface RadioContextType {
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  currentSong: Song | null;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar volume salvo do localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("radio_volume");
    if (savedVolume) {
      setVolumeState(parseInt(savedVolume));
    }
  }, []);

  // Carregar playlist
  useEffect(() => {
    fetch('/music/playlist.json')
      .then(res => res.json())
      .then((songs: Song[]) => {
        // Embaralhar playlist
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        setPlaylist(shuffled);
        if (shuffled.length > 0) {
          setCurrentSong(shuffled[0]);
        }
      })
      .catch(err => console.error('Erro ao carregar playlist:', err));
  }, []);

  // Inicializar o áudio
  useEffect(() => {
    if (!currentSong || !playlist.length) return;

    const audioUrl = `/music/${currentSong.file}`;
    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = volume / 100;
    audioRef.current.preload = "auto";

    // Autoplay na primeira música
    const isFirstLoad = currentSongIndex === 0 && !isPlaying;
    if (isFirstLoad) {
      setIsLoading(true);
      // Tentar autoplay (pode falhar devido a políticas do navegador)
      audioRef.current.play().catch((error) => {
        console.log('Autoplay bloqueado pelo navegador:', error);
        setIsLoading(false);
      });
    }

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
      console.error('Erro ao carregar música');
    });

    // Quando a música terminar, tocar a próxima
    audioRef.current.addEventListener("ended", () => {
      const nextIndex = (currentSongIndex + 1) % playlist.length;
      setCurrentSongIndex(nextIndex);
      setCurrentSong(playlist[nextIndex]);
    });

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [currentSong, playlist]);

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
        currentSong,
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
