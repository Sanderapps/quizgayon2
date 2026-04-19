import { ChevronUp, ListMusic, MessageCircle, Music, Radio, Volume2 } from "lucide-react";
import { useRadio } from "@/contexts/RadioContext";
import { useEffect, useState } from "react";

export function RadioPlayer() {
  const {
    isPlaying,
    isLoading,
    autoplayBlocked,
    currentSong,
    queue,
    totalSongs,
    currentPosition,
    currentDuration,
    togglePlay,
  } = useRadio();
  const [isExpanded, setIsExpanded] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestSong, setRequestSong] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const visibleQueue = queue.slice(0, 4);

  useEffect(() => {
    const handleMenuState = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      const open = Boolean(customEvent.detail?.open);
      setIsMenuOpen(open);
      if (open) setIsExpanded(false);
    };

    window.addEventListener("quiz:menu-state", handleMenuState as EventListener);
    return () => window.removeEventListener("quiz:menu-state", handleMenuState as EventListener);
  }, []);

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
        alert('Pedido enviado. Se entrar na fila, ele aparece aqui.');
        setRequestName('');
        setRequestSong('');
      } else {
        alert('Não foi possível enviar o pedido agora.');
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Não foi possível enviar o pedido agora.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const playbackProgress = currentDuration > 0 ? Math.min((currentPosition / currentDuration) * 100, 100) : 0;

  return (
    <>
      {isExpanded && (
        <div
          id="radio-player-panel"
          className="fixed inset-x-0 bottom-[74px] z-[85] px-4 md:bottom-[88px]"
        >
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white/96 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0f19]/96">
            <div className="grid gap-4 md:grid-cols-[1.15fr,0.85fr]">
              <div className="space-y-4">
                <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700/70 dark:text-cyan-200/70">Tocando agora</div>
                  <div className="text-base font-semibold leading-tight text-slate-900 dark:text-slate-50 md:text-lg">
                    {currentSong?.title || "QuiZoeira Radio"}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {currentSong?.artist || "Programação contínua"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <span>Progresso</span>
                    <span>{currentDuration > 0 ? `${currentPosition}s / ${currentDuration}s` : "Ao vivo"}</span>
                  </div>
                  <div className="progress-neon">
                    <div className="progress-neon-fill" style={{ width: `${playbackProgress}%` }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <Music className="h-4 w-4 text-amber-400" />
                    Pedir uma música
                  </div>
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Manda artista e faixa. Se entrar na programação, aparece na fila.</p>
                  <form onSubmit={handleRequestSubmit} className="grid gap-3 sm:grid-cols-[0.8fr,1.2fr,auto] sm:items-start">
                    <input
                      type="text"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-fuchsia-400/60 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-purple-400/50"
                      maxLength={50}
                    />
                    <textarea
                      value={requestSong}
                      onChange={(e) => setRequestSong(e.target.value)}
                      placeholder="Artista - Música"
                      className="min-h-[48px] w-full resize-none rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-fuchsia-400/60 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-purple-400/50"
                      rows={2}
                      maxLength={200}
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !requestSong.trim()}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isSubmitting ? "Enviando..." : "Pedir"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <ListMusic className="h-4 w-4 text-cyan-400" />
                  Próximas músicas
                </div>
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Prévia da fila atual da rádio.</p>
                <div className="space-y-2">
                  {visibleQueue.length > 0 ? (
                    visibleQueue.map((song, index) => (
                      <div key={`${song.artist}-${song.title}-${index}`} className="rounded-xl border border-slate-200/80 bg-white px-3 py-3 dark:border-white/6 dark:bg-slate-950/50">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">#{index + 1} na fila</div>
                        <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{song.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{song.artist}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200/90 px-3 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                      A fila aparece aqui quando a programação carregar as próximas músicas.
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-slate-500">{totalSongs} faixas no acervo atual</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed bottom-0 left-0 right-0 z-[80] transition-all duration-200 ${isMenuOpen ? "pointer-events-none translate-y-6 opacity-0" : "translate-y-0 opacity-100"}`}>
        <div className="absolute inset-0 dark:bg-[#0a0a16]/90 bg-white/95 backdrop-blur-xl border-t dark:border-purple-500/10 border-gray-200" />

        <div className="relative max-w-7xl mx-auto px-4 py-2.5 md:py-3 flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 dark:bg-white/10 bg-gray-100 dark:hover:bg-white/15 hover:bg-gray-200 dark:border border-purple-500/20 border-gray-200"
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Volume2 className="w-5 h-5 text-purple-300" />
              ) : (
                <Radio className="w-5 h-5 dark:text-gray-300 text-gray-600 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              aria-controls="radio-player-panel"
              aria-label={isExpanded ? "Fechar painel da rádio" : "Abrir painel da rádio"}
              className="flex flex-1 min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Rádio
                </p>
                <p className="truncate text-sm font-bold dark:text-white text-gray-900">
                  {currentSong ? currentSong.artist : 'QuiZoeira Radio'}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate dark:text-gray-500 text-gray-400 text-[11px]">
                  {currentSong ? currentSong.title : (isPlaying ? "Programação ao vivo" : "Pronto para tocar")}
                </p>
                {autoplayBlocked && (
                  <p className="truncate pt-0.5 text-[10px] font-medium text-amber-500">
                  Toque em reproduzir para retomar a rádio
                  </p>
                )}
              </div>
              <ChevronUp className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              aria-controls="radio-player-panel"
              aria-label={isExpanded ? "Fechar painel da rádio" : "Abrir painel da rádio"}
              className="w-9 h-9 rounded-lg flex items-center justify-center dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600"
              title="Abrir painel da rádio"
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggleChat'))}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-3 py-2 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
