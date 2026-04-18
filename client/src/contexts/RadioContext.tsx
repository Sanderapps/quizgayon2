import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { io } from "socket.io-client";

const RADIO_VOLUME_KEY = "radio_volume";
const RADIO_SHOULD_RESUME_KEY = "radio_should_resume";
const STREAM_URL = "/api/radio/stream";

interface Song {
  title: string;
  artist: string;
}

interface RadioContextType {
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  autoplayBlocked: boolean;
  currentSong: Song | null;
  totalSongs: number;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [totalSongs, setTotalSongs] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldResumeRef = useRef(false);
  const resumeOnInteractionRef = useRef(false);

  // Carregar volume salvo do localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem(RADIO_VOLUME_KEY);
    if (savedVolume) {
      setVolumeState(parseInt(savedVolume));
    }

    shouldResumeRef.current = localStorage.getItem(RADIO_SHOULD_RESUME_KEY) === "true";
  }, []);

  // Inicializar o áudio com o stream do servidor
  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume / 100;
    audioRef.current.preload = "none";
    
    const audio = audioRef.current;

    const resumePlayback = async () => {
      if (!audioRef.current || !shouldResumeRef.current || isPlaying) return;

      const liveStreamUrl = `${STREAM_URL}?t=${Date.now()}`;
      audioRef.current.src = liveStreamUrl;
      audioRef.current.load();
      setIsLoading(true);

      try {
        await audioRef.current.play();
        resumeOnInteractionRef.current = false;
        setAutoplayBlocked(false);
      } catch (error) {
        console.warn("Autoplay da rádio foi bloqueado; aguardando interação do usuário.", error);
        setIsLoading(false);
        resumeOnInteractionRef.current = true;
        setAutoplayBlocked(true);
      }
    };

    const handleUserInteraction = () => {
      if (!resumeOnInteractionRef.current) return;
      resumePlayback().catch(console.error);
    };

    audio.addEventListener('seeking', () => {
      if (audioRef.current) {
        audioRef.current.currentTime = audioRef.current.duration || 0;
      }
    });

    audio.addEventListener("playing", () => {
      setIsLoading(false);
      setIsPlaying(true);
      setAutoplayBlocked(false);
    });

    audio.addEventListener("waiting", () => {
      setIsLoading(true);
    });

    audio.addEventListener("pause", () => {
      setIsPlaying(false);
      setIsLoading(false);
    });

    audio.addEventListener("error", (e) => {
      setIsLoading(false);
      setIsPlaying(false);
      setAutoplayBlocked(false);
      console.error('Erro ao carregar stream de rádio:', e);
    });

    window.addEventListener("pointerdown", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    resumePlayback().catch(console.error);

    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);

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
      localStorage.setItem(RADIO_VOLUME_KEY, volume.toString());
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

  // Sincronização em tempo real via WebSocket
  useEffect(() => {
    const socket = io();

    socket.on('radio:songChanged', (data) => {
      console.log('📡 Música trocada pelo admin:', data.song.title);
      
      // Se está tocando, reconecta ao stream para sincronizar
      if (isPlaying && audioRef.current) {
        const streamUrl = `/api/radio/stream?t=${Date.now()}`;
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        audioRef.current.play().catch(console.error);
      }

      // Atualiza informações da música
      setCurrentSong({
        title: data.song.title,
        artist: data.song.artist
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      shouldResumeRef.current = false;
      resumeOnInteractionRef.current = false;
      localStorage.setItem(RADIO_SHOULD_RESUME_KEY, "false");
      setAutoplayBlocked(false);
      audioRef.current.pause();
      audioRef.current.src = "";
    } else {
      shouldResumeRef.current = true;
      localStorage.setItem(RADIO_SHOULD_RESUME_KEY, "true");
      audioRef.current.src = `${STREAM_URL}?t=${Date.now()}`;
      audioRef.current.load();
      
      setIsLoading(true);
      audioRef.current.play().catch((error) => {
        console.error("Erro ao reproduzir:", error);
        setIsLoading(false);
        resumeOnInteractionRef.current = true;
        setAutoplayBlocked(true);
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
        autoplayBlocked,
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
