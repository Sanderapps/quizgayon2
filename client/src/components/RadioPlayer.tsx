import { MessageCircle, Music } from "lucide-react";
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
        body: JSON.stringify({
          name: requestName || 'Anônimo',
          song: requestSong
        })
      });

      if (response.ok) {
        alert('Pedido enviado com sucesso! 🎵');
        setRequestName('');
        setRequestSong('');
        setShowRequestModal(false);
      } else {
        alert('Erro ao enviar pedido. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[9997] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-2xl border-t-2 border-white/20">
        {/* Container principal com padding reduzido */}
        <div className="max-w-7xl mx-auto px-4 py-1 md:py-1.5 flex items-center justify-between gap-4 relative">
          {/* Lado Esquerdo: Play/Pause + Info da Música */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {/* Botão Play/Pause - menor em mobile */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isLoading ? (
                <div className="w-4 h-4 md:w-5 md:h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Info da Música */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm md:text-base truncate flex items-center gap-1 md:gap-2">
                {isPlaying && (
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-2 md:h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1 h-3 md:h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1 h-2 md:h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
                  </span>
                )}
                📻 QuiZoeira
              </p>
              <p className="text-white/70 text-[10px] md:text-xs truncate leading-tight">
                {currentSong ? `${currentSong.title} - ${currentSong.artist}` : (isPlaying ? "Ao vivo" : "Parado")}
              </p>
            </div>

            {/* Contador de Músicas - escondido em telas muito pequenas */}
            {totalSongs > 0 && (
              <span className="hidden sm:inline-block text-white/70 text-xs md:text-sm whitespace-nowrap px-2 py-1 bg-white/10 rounded-full flex-shrink-0">
                {totalSongs} músicas
              </span>
            )}
          </div>

          {/* Lado Direito: Botões FLUTUANTES PRA CIMA */}
          <div className="absolute right-4 top-0 -translate-y-1/2 flex gap-2">
            {/* Botão Peça sua Música - escondido em mobile muito pequeno */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="hidden sm:flex px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(251,191,36,0.8)] hover:scale-110 active:scale-95 transition-all items-center gap-2 text-white font-black text-sm md:text-base"
              title="Peça sua Música"
              style={{
                boxShadow: "0 0 25px rgba(251, 191, 36, 0.7), 0 10px 30px rgba(0,0,0,0.3)"
              }}
            >
              <Music className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">Peça sua Música</span>
              <span className="md:hidden">Música</span>
            </button>

            {/* Botão Chat */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggleChat'));
              }}
              className="px-3 py-2 md:px-6 md:py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl shadow-2xl hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] hover:scale-110 active:scale-95 transition-all flex items-center gap-2 text-white font-black text-sm md:text-base relative overflow-hidden chat-button"
              title="Chat Global (Clique para abrir/fechar)"
              style={{
                animation: "gradient-shift 3s ease infinite, pulse-glow 2s ease-in-out infinite, bounce-subtle 1.5s ease-in-out infinite",
                backgroundSize: "200% 200%",
                boxShadow: "0 0 30px rgba(236, 72, 153, 0.8), 0 0 50px rgba(168, 85, 247, 0.6), 0 10px 30px rgba(0,0,0,0.3)"
              }}
            >
              <MessageCircle className="w-4 h-4 md:w-6 md:h-6" />
              <span className="text-xs md:text-base">Chat</span>
              {/* Indicador de chat aberto */}
              <span className="chat-open-indicator hidden absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* Animações CSS Customizadas */}
        <style>{`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.8), 0 0 50px rgba(168, 85, 247, 0.6); }
            50% { box-shadow: 0 0 40px rgba(236, 72, 153, 1), 0 0 70px rgba(168, 85, 247, 0.9); }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}</style>
      </div>

      {/* Modal de Pedido de Música */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <Music className="w-6 h-6" />
              Peça sua Música 🎵
            </h2>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seu Nome (opcional)
                </label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Anônimo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qual música você quer ouvir? *
                </label>
                <textarea
                  value={requestSong}
                  onChange={(e) => setRequestSong(e.target.value)}
                  placeholder="Ex: Backstreet Boys - I Want It That Way"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={3}
                  required
                  maxLength={200}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !requestSong.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
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
