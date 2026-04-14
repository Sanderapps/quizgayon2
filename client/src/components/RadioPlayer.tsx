import { MessageCircle, Music, Volume2, Radio } from "lucide-react";
import { useRadio } from "@/contexts/RadioContext";
import { useState } from "react";

export function RadioPlayer() {
  const { isPlaying, isLoading, currentSong, totalSongs, togglePlay } = useRadio();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestSong, setRequestSong] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/music-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: requestName || 'Anônimo', song: requestSong })
      });
      if (response.ok) {
        alert('Pedido enviado com sucesso! 🎵');
        setRequestName('');
        setRequestSong('');
        setShowRequestModal(false);
      } else {
        alert('Erro ao enviar pedido. Tente novamente.');
      }
    } catch {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Radio Bar — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-[9997]">
        {/* Glass background */}
        <div className="absolute inset-0 dark:bg-[#0a0a16]/90 bg-white/95 backdrop-blur-xl border-t dark:border-purple-500/10 border-gray-200" />

        <div className="relative max-w-7xl mx-auto px-4 py-2.5 md:py-3 flex items-center gap-3">
          {/* Left: Play + Song Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 dark:bg-white/10 bg-gray-100 dark:hover:bg-white/15 hover:bg-gray-200 dark:border border-purple-500/20 border-gray-200"
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <>
                  {/* Equalizer bars */}
                  <span className="flex gap-[3px]">
                    <span className="w-[3px] h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                    <span className="w-[3px] h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-[3px] h-5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  </span>
                </>
              ) : (
                <Radio className="w-5 h-5 dark:text-gray-300 text-gray-600 ml-0.5" />
              )}
            </button>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm dark:text-white text-gray-900 truncate flex items-center gap-2">
                  {isPlaying && (
                    <span className="flex gap-[2px]">
                      <span className="w-[2px] h-2.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                      <span className="w-[2px] h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
                      <span className="w-[2px] h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
                    </span>
                  )}
                  <span className="dark:text-gray-400 text-gray-500 text-xs font-normal">📻</span>
                  {currentSong ? currentSong.artist : 'QuiZoeira Radio'}
                </p>
              </div>
              <p className="dark:text-gray-500 text-gray-400 text-[11px] truncate">
                {currentSong ? currentSong.title : (isPlaying ? "Ao vivo" : "Parado")}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Request Music */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600 dark:border border-amber-500/20 border-amber-200"
              title="Peça sua Música"
            >
              <Music className="w-3.5 h-3.5" />
              Peça sua Música
            </button>

            {/* Mobile: icon only */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600"
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggleChat'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 0 12px rgba(168, 85, 247, 0.3), 0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Music Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="dark:bg-[#0e0e1a] bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border dark:border-purple-500/20 border-gray-200">
            <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 dark:text-gray-500 text-gray-400 hover:text-gray-200 text-xl">
              ×
            </button>

            <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-900 flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-500" />
              Peça sua Música 🎵
            </h2>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-500 mb-1">Seu Nome (opcional)</label>
                <input type="text" value={requestName} onChange={(e) => setRequestName(e.target.value)} placeholder="Anônimo"
                  className="w-full px-4 py-2.5 rounded-xl dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 dark:border-purple-500/20 border-gray-200 border-2 focus:border-purple-500 focus:outline-none transition-colors text-sm"
                  maxLength={50} />
              </div>
              <div>
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-500 mb-1">Qual música você quer ouvir? *</label>
                <textarea value={requestSong} onChange={(e) => setRequestSong(e.target.value)}
                  placeholder="Ex: Backstreet Boys - I Want It That Way"
                  className="w-full px-4 py-2.5 rounded-xl dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 dark:border-purple-500/20 border-gray-200 border-2 focus:border-purple-500 focus:outline-none transition-colors resize-none text-sm"
                  rows={3} required maxLength={200} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl dark:bg-white/5 bg-gray-100 dark:text-gray-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting || !requestSong.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", boxShadow: "0 0 12px rgba(245, 158, 11, 0.3)" }}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
