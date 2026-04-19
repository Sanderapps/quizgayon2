import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { changelog } from "@/data/changelog";
import {
  ChevronRight,
  ClipboardList,
  Gamepad2,
  Home,
  Lightbulb,
  Menu,
  MessageCircle,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Trophy,
  X,
} from "lucide-react";

interface TopMenuProps {
  onNavigate?: (page: string) => void;
}

export function TopMenu({ onNavigate }: TopMenuProps) {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [message, setMessage] = useState("");
  const [apelido, setApelido] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("quiz:menu-state", { detail: { open: isOpen } }));

    return () => {
      window.dispatchEvent(new CustomEvent("quiz:menu-state", { detail: { open: false } }));
    };
  }, [isOpen]);

  const navigationItems = useMemo(
    () => [
      { icon: Home, page: "home", label: "Início", description: "Voltar para a arena principal" },
      { icon: Gamepad2, page: "quiz", label: "Jogar", description: "Abrir a seleção de quizzes" },
      { icon: Trophy, page: "leaderboard", label: "Placar", description: "Ver ranking e resultados" },
      { icon: MessageCircle, page: "chat", label: "Chat", description: "Abrir o chat da comunidade" },
      { icon: Shield, page: "admin", label: "Admin", description: "Entrar na área administrativa" },
    ],
    [],
  );

  const handleItemClick = (page: string) => {
    if (page === "chat") {
      window.dispatchEvent(new CustomEvent("toggleChat"));
      setIsOpen(false);
      return;
    }

    if (page === "admin") {
      setLocation("/admin");
      setIsOpen(false);
      return;
    }

    if (page === "home" || page === "quiz") {
      setLocation("/");
      setIsOpen(false);
      if (page === "quiz" && onNavigate) onNavigate(page);
      return;
    }

    if (onNavigate) {
      onNavigate(page);
    }

    setIsOpen(false);
  };

  const handleSubmitSuggestion = async () => {
    if (!message.trim() || !apelido.trim()) {
      setFeedback({ type: "error", text: "Preencha todos os campos." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apelido: apelido.trim(), mensagem: message.trim() }),
      });

      if (response.ok) {
        setFeedback({ type: "success", text: "Sugestão enviada." });
        setMessage("");
        setApelido("");
        setTimeout(() => {
          setShowSuggestions(false);
          setFeedback(null);
        }, 1800);
        return;
      }

      const errorData = await response.json();
      setFeedback({ type: "error", text: errorData.message || "Erro ao enviar sugestão." });
    } catch {
      setFeedback({ type: "error", text: "Erro de conexão. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) handleSubmitSuggestion();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed right-4 top-4 z-[95] flex h-12 items-center gap-2 rounded-lg border border-slate-200/75 bg-white/86 px-3 text-slate-800 shadow-[0_10px_28px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all hover:border-fuchsia-300/60 dark:border-white/10 dark:bg-slate-950/82 dark:text-slate-100 dark:hover:border-purple-400/30"
        aria-label="Abrir menu"
      >
        <Menu className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">Menu</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[109] bg-slate-950/42 backdrop-blur-sm dark:bg-black/70"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed z-[110] transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"
        } bottom-0 left-0 right-0 md:bottom-4 md:left-auto md:right-4 md:top-20 md:w-[24rem]`}
        aria-hidden={!isOpen}
      >
        <div className="arena-panel rounded-t-3xl border-b-0 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:rounded-2xl md:border-b">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/35 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-700 dark:border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-200">
                <Sparkles className="h-3.5 w-3.5" />
                Navegação
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">QuiZoeira</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Acesso rápido, ajustes e novidades sem atrapalhar a rodada.</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-slate-200/70 bg-white/75 p-2 text-slate-500 transition-colors hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Navegação</h3>
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button key={item.page} onClick={() => handleItemClick(item.page)} className="menu-item-row">
                      <span className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:bg-white/5 dark:text-purple-300">
                            <IconComponent className="h-4 w-4" />
                          </span>
                          <span className="text-left">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                          </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Preferências</h3>
              <div className="space-y-2">
                <button onClick={() => toggleTheme?.()} className="menu-item-row">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:bg-white/5 dark:text-cyan-300">
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </span>
                    <span className="text-left">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Tema {isDark ? "claro" : "escuro"}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Alternar atmosfera e contraste</span>
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowSuggestions(true);
                    setIsOpen(false);
                  }}
                  className="menu-item-row"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-white/5 dark:text-amber-300">
                      <Lightbulb className="h-4 w-4" />
                    </span>
                    <span className="text-left">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Sugestões</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Enviar ideia, feedback ou ajuste</span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    setShowUpdates(true);
                    setIsOpen(false);
                  }}
                  className="menu-item-row"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:bg-white/5 dark:text-pink-300">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <span className="text-left">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Atualizações</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Ver changelog fora do menu principal</span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </aside>

      {showUpdates && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="arena-panel w-full max-w-xl rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Atualizações</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Mudanças recentes sem disputar espaço com a navegação.</p>
              </div>
              <button
                onClick={() => setShowUpdates(false)}
                className="rounded-lg border border-slate-200/70 bg-white/70 p-2 text-slate-500 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                aria-label="Fechar atualizações"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {changelog.map((entry, index) => (
                <div key={index} className="arena-panel-soft rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{entry.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          {entry.version}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{entry.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSuggestions && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="arena-panel w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Sugestões</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Manda a ideia com contexto suficiente para virar ajuste de verdade.</p>
              </div>
              <button onClick={() => setShowSuggestions(false)} className="rounded-lg border border-slate-200/70 bg-white/70 p-2 text-slate-500 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Seu nome ou apelido</label>
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  placeholder="Como quer aparecer?"
                  maxLength={30}
                  className="w-full rounded-xl border border-slate-200/80 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-fuchsia-400/60 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-purple-400/50"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Sugestão</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Descreva problema, ideia ou melhoria."
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-fuchsia-400/60 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-purple-400/50"
                  disabled={isSubmitting}
                />
                <div className="mt-1 text-right text-[11px] text-slate-500 dark:text-slate-500">{message.length}/500</div>
              </div>
            </div>

            {feedback && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-red-400/20 bg-red-500/10 text-red-300"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSuggestions(false)}
                className="flex-1 rounded-xl border border-slate-200/80 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button onClick={handleSubmitSuggestion} className="neon-btn flex-1 rounded-xl px-4 py-3 text-sm font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
