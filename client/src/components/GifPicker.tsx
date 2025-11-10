import { useState, useEffect } from "react";

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    gif: {
      url: string;
    };
  };
}

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

const TENOR_API_KEY = "AIzaSyAJ_wFzBIsxGzZDNd5DxkysR6j78bz-roM"; // API key do usuário

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar GIFs trending ao abrir
  useEffect(() => {
    fetchTrendingGifs();
  }, []);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=20&media_filter=gif`
      );
      const data = await response.json();
      // Filtrar GIFs que têm a estrutura completa de media_formats
      const validGifs = (data.results || []).filter(
        (gif: TenorGif) => gif.media_formats?.gif?.url
      );
      setGifs(validGifs);
    } catch (error) {
      console.error("Erro ao buscar GIFs trending:", error);
    }
    setLoading(false);
  };

  const searchGifs = async (term: string) => {
    if (!term.trim()) {
      fetchTrendingGifs();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(term)}&key=${TENOR_API_KEY}&limit=20&media_filter=gif`
      );
      const data = await response.json();
      // Filtrar GIFs que têm a estrutura completa de media_formats
      const validGifs = (data.results || []).filter(
        (gif: TenorGif) => gif.media_formats?.gif?.url
      );
      setGifs(validGifs);
    } catch (error) {
      console.error("Erro ao buscar GIFs:", error);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(searchTerm);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🎬 Buscar GIF
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar GIFs... (ex: happy, cat, dance)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
            autoFocus
          />
        </form>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando GIFs...</p>
            </div>
          ) : gifs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Nenhum GIF encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => {
                    onSelect(gif.media_formats.gif.url);
                    onClose();
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg hover:ring-4 hover:ring-pink-500 transition-all active:scale-95"
                >
                  <img
                    src={gif.media_formats.gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Tenor
          </p>
        </div>
      </div>
    </div>
  );
}
