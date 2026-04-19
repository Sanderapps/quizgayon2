import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { io } from "socket.io-client";

const RADIO_VOLUME_KEY = "radio_volume";
const RADIO_SHOULD_RESUME_KEY = "radio_should_resume";
const STREAM_URL = "/api/radio/stream";

interface Song {
  title: string;
  artist: string;
}

interface SongQueueEntry {
  title: string;
  artist: string;
}

interface RadioContextType {
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  autoplayBlocked: boolean;
  currentSong: Song | null;
  queue: SongQueueEntry[];
  currentPosition: number;
  currentDuration: number;
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
  const [queue, setQueue] = useState<SongQueueEntry[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldResumeRef = useRef(false);
  const resumeOnInteractionRef = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const manualStopRef = useRef(false);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const connectToLiveStream = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    clearReconnectTimeout();
    audio.src = `${STREAM_URL}?t=${Date.now()}`;
    audio.load();
    setIsLoading(true);
    await audio.play();
  };

  const scheduleReconnect = (reason: "ended" | "error" | "songChanged", delay = 700) => {
    if (!audioRef.current || !shouldResumeRef.current || reconnectTimeoutRef.current !== null) {
      return;
    }

    console.log(`[RÁDIO] Tentando reconectar após ${reason} em ${delay}ms`);
    setIsLoading(true);
    setIsPlaying(true);

    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectToLiveStream().catch((error) => {
        console.error(`[RÁDIO] Falha ao reconectar após ${reason}:`, error);

        if (error instanceof DOMException && error.name === "NotAllowedError") {
          resumeOnInteractionRef.current = true;
          setAutoplayBlocked(true);
          setIsLoading(false);
          return;
        }

        scheduleReconnect(reason, Math.min(delay + 500, 2500));
      });
    }, delay);
  };

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

      try {
        await connectToLiveStream();
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
      if (!manualStopRef.current && shouldResumeRef.current) {
        return;
      }

      manualStopRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
    });

    audio.addEventListener("ended", () => {
      if (!shouldResumeRef.current) return;
      scheduleReconnect("ended");
    });

    audio.addEventListener("error", (e) => {
      console.error('Erro ao carregar stream de rádio:', e);

      if (shouldResumeRef.current) {
        scheduleReconnect("error", 1000);
        return;
      }

      setIsLoading(false);
      setIsPlaying(false);
      setAutoplayBlocked(false);
    });

    window.addEventListener("pointerdown", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    resumePlayback().catch(console.error);

    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      clearReconnectTimeout();

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
    const fetchRadioState = async () => {
      try {
        const [nowPlayingResponse, queueResponse] = await Promise.all([
          fetch('/api/radio/nowplaying'),
          fetch('/api/radio/queue'),
        ]);

        if (nowPlayingResponse.ok) {
          const data = await nowPlayingResponse.json();
          setCurrentSong({
            title: data.title,
            artist: data.artist
          });
          setTotalSongs(data.total);
          setCurrentPosition(data.position || 0);
          setCurrentDuration(data.duration || 0);
        }

        if (queueResponse.ok) {
          const data = await queueResponse.json();
          setQueue(data.upcoming || []);
        }
      } catch (error) {
        console.error('Erro ao buscar informações da música:', error);
      }
    };

    fetchRadioState();

    const interval = setInterval(fetchRadioState, 10000);

    return () => clearInterval(interval);
  }, []);

  // Sincronização em tempo real via WebSocket
  useEffect(() => {
    const socket = io();

    socket.on('radio:songChanged', (data) => {
      console.log('📡 Música trocada pelo admin:', data.song.title);
      
      // Se está tocando, reconecta ao stream para sincronizar
      if (isPlaying && audioRef.current) {
        scheduleReconnect("songChanged", 150);
      }

      // Atualiza informações da música
      setCurrentSong({
        title: data.song.title,
        artist: data.song.artist
      });
      setCurrentPosition(data.song.position || 0);
      setCurrentDuration(data.song.duration || 0);

      fetch('/api/radio/queue')
        .then((response) => response.ok ? response.json() : null)
        .then((payload) => {
          if (payload?.upcoming) {
            setQueue(payload.upcoming);
          }
        })
        .catch(console.error);
    });

    return () => {
      socket.disconnect();
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      manualStopRef.current = true;
      shouldResumeRef.current = false;
      resumeOnInteractionRef.current = false;
      clearReconnectTimeout();
      localStorage.setItem(RADIO_SHOULD_RESUME_KEY, "false");
      setAutoplayBlocked(false);
      audioRef.current.pause();
      audioRef.current.src = "";
    } else {
      manualStopRef.current = false;
      shouldResumeRef.current = true;
      localStorage.setItem(RADIO_SHOULD_RESUME_KEY, "true");
      setIsLoading(true);
      connectToLiveStream().catch((error) => {
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
        queue,
        currentPosition,
        currentDuration,
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
