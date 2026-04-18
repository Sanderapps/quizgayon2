import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SkipForward, RotateCcw, Music, Key, Radio, Play } from "lucide-react";
import { TopMenu } from "@/components/TopMenu";

interface Song {
  file: string;
  title: string;
  artist: string;
}

interface RadioStats {
  currentSong: {
    title: string;
    artist: string;
  };
  totalSongs: number;
  listeners: number;
}

export default function AdminRadio() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSong, setCurrentSong] = useState<RadioStats | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(loadStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/radio/stats");
      const data = await response.json();
      setCurrentSong(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const loadPlaylist = async () => {
    try {
      const response = await fetch("/api/radio/admin/playlist", {
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });
      if (!response.ok) {
        console.error("Erro ao carregar playlist:", response.status);
        return;
      }
      const data = await response.json();
      setPlaylist(data.playlist || []);
    } catch (error) {
      console.error("Erro ao carregar playlist:", error);
    }
  };

  const handleAuth = async () => {
    const trimmedKey = adminKey.trim();
    if (!trimmedKey) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/radio/admin/playlist", {
        headers: {
          Authorization: `Bearer ${trimmedKey}`,
        },
      });

      if (!response.ok) {
        setMessage("❌ Chave inválida");
        return;
      }

      const data = await response.json();
      setAdminKey(trimmedKey);
      setPlaylist(data.playlist || []);
      setIsAuthenticated(true);
      loadStats();
      setMessage("✅ Autenticado com sucesso!");
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      setMessage("❌ Erro ao autenticar");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAdminAction = async (action: string) => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/radio/admin/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${action === "next" ? "Música pulada" : "Playlist reiniciada"}!`);
        loadStats();
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Erro ao executar ação");
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handlePlaySong = async (index: number) => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/radio/admin/play/${index}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Tocando: ${playlist[index].title}`);
        loadStats();
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Erro ao tocar música");
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    setAdminKey("");
    setIsAuthenticated(false);
    setPlaylist([]);
    setCurrentSong(null);
    setMessage("👋 Desconectado");
    setTimeout(() => setMessage(""), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Key className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin da Rádio</h1>
            <p className="text-gray-600 text-sm">
              Insira a chave de administração para acessar os controles
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Chave de Admin"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              className="text-center"
            />
            <Button
              onClick={handleAuth}
              disabled={isLoading || !adminKey.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg"
            >
              {isLoading ? "Validando..." : "Entrar"}
            </Button>
          </div>

          {message && (
            <div className="text-center text-sm font-medium text-gray-700">
              {message}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 pb-20">
      <TopMenu />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Painel de Admin - Rádio
                  </h1>
                  <p className="text-sm text-gray-600">Controle total da rádio</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              >
                Sair
              </Button>
            </div>
          </Card>

          {/* Estatísticas */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Música Atual
            </h2>
            {currentSong ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Título:</span>
                  <span className="font-bold text-gray-800">
                    {currentSong?.currentSong?.title || "Carregando..."}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Artista:</span>
                  <span className="font-medium text-gray-700">
                    {currentSong?.currentSong?.artist || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de Músicas:</span>
                  <span className="font-medium text-gray-700">
                    {currentSong?.totalSongs || 0}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Carregando estatísticas...
              </p>
            )}
          </Card>

          {/* Controles */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Controles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleAdminAction("next")}
                disabled={isLoading}
                className="h-20 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg"
              >
                <SkipForward className="w-6 h-6 mr-2" />
                Pular Música
              </Button>

              <Button
                onClick={() => handleAdminAction("restart")}
                disabled={isLoading}
                className="h-20 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg"
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                Reiniciar Playlist
              </Button>
            </div>

            {message && (
              <div className="mt-4 text-center p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-800">
                {message}
              </div>
            )}
          </Card>

          {/* Lista de Músicas */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Playlist ({playlist.length} músicas)
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlist.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {song.artist}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePlaySong(index)}
                    disabled={isLoading}
                    className="ml-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-md flex-shrink-0"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Tocar
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>Dica:</strong> As mudanças afetam todos os ouvintes em
              tempo real
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
