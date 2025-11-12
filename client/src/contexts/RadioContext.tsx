import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { io } from "socket.io-client";

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
    // Adiciona timestamp para evitar cache e sempre pegar o stream ao vivo
    const streamUrl = '/api/radio/stream';
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = volume / 100;
    audioRef.current.preload = "none"; // Não pré-carregar, pois é um stream
    
    // Desabilita seeking para comportamento de rádio ao vivo
    audioRef.current.addEventListener('seeking', (e) => {
      if (audioRef.current) {
        audioRef.current.currentTime = audioRef.current.duration || 0;
      }
    });

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
      // Para o stream
      audioRef.current.pause();
      audioRef.current.src = ""; // Desconecta do stream
    } else {
      // Reconecta ao stream ao vivo (sempre pega o momento atual)
      const streamUrl = `/api/radio/stream?t=${Date.now()}`;
      audioRef.current.src = streamUrl;
      audioRef.current.load();
      
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
