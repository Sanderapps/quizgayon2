import { useState, useEffect } from "react";
import { changelog } from "@/data/changelog";
import { Home, Gamepad2, Trophy, MessageCircle, Shield, Lightbulb, Sun, Moon, Menu, X, ClipboardList, Sparkles } from "lucide-react";

interface TopMenuProps {
  onNavigate?: (page: string) => void;
}

export function TopMenu({ onNavigate }: TopMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [message, setMessage] = useState("");
  const [apelido, setApelido] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const menuItems = [
    { icon: Home, page: "home", label: "Início" },
    { icon: Gamepad2, page: "quiz", label: "Jogar" },
    { icon: Trophy, page: "leaderboard", label: "Placar" },
    { icon: MessageCircle, page: "chat", label: "Chat" },
    { icon: Shield, page: "admin", label: "Admin" },
    { icon: Lightbulb, page: "suggestions", label: "Sugestões" },
    { icon: isDark ? Sun : Moon, page: "theme", label: isDark ? "Claro" : "Escuro" },
  ];

  const handleItemClick = (page: string) => {
    if (page === "chat") {
      window.dispatchEvent(new CustomEvent('toggleChat'));
      setIsOpen(false);
      return;
    }
    if (page === "admin") {
      window.location.href = "/admin";
      setIsOpen(false);
      return;
    }
    if (page === "home") {
      window.location.href = "/";
      setIsOpen(false);
      return;
    }
    if (page === "suggestions") {
      setIsOpen(false);
      setShowSuggestions(true);
      return;
    }
    if (page === "theme") {
      setIsDark(!isDark);
      return;
    }
    if (onNavigate) {
      onNavigate(page);
    }
    setIsOpen(false);
  };

  const handleSubmitSuggestion = async () => {
    if (!message.trim() || !apelido.trim()) {
      setFeedback({ type: 'error', text: 'Preencha todos os campos!' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apelido: apelido.trim(), mensagem: message.trim() }),
      });
      if (response.ok) {
        setFeedback({ type: 'success', text: 'Sugestão enviada com sucesso! Obrigado! 💖' });
        setMessage("");
        setApelido("");
        setTimeout(() => { setShowSuggestions(false); setFeedback(null); }, 2000);
      } else {
        const errorData = await response.json();
        setFeedback({ type: 'error', text: errorData.message || 'Erro ao enviar sugestão.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erro de conexão. Verifique sua internet.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) handleSubmitSuggestion();
  };

  return (
    <>
      {/* Hamburger Button — fixed top-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[70] w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 dark:bg-white/5 bg-gray-900/5 border dark:border-purple-500/20 border-gray-200 backdrop-blur-xl"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 dark:text-white text-gray-900" />
        ) : (
          <Menu className="w-5 h-5 dark:text-white text-gray-900" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md rounded-2xl overflow-hidden dark:bg-[#0e0e1a]/95 bg-white shadow-2xl border dark:border-purple-500/20 border-gray-200 backdrop-blur-xl"
          style={{ animation: "menu-expand 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          {/* Navigation */}
          <div className="p-5 dark:border-b border-purple-500/10 border-gray-100">
            <h3 className="text-sm font-bold dark:text-gray-300 text-gray-600 mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Navegação</span>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.page}
                    onClick={() => handleItemClick(item.page)}
                    className="flex flex-col items-center justify-center transition-all group"
                    title={item.label}
                  >
                    <div className="w-14 h-14 rounded-xl dark:bg-white/5 bg-gray-50 flex items-center justify-center dark:group-hover:bg-purple-500/15 group-hover:bg-purple-50 transition-all group-hover:scale-110">
                      <IconComponent className="w-5 h-5 dark:text-gray-400 text-gray-600 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <span className="hidden sm:block text-[9px] mt-1 dark:text-gray-500 text-gray-400 font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Changelog */}
          <div className="p-4 dark:border-b border-purple-500/10 border-gray-100 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-bold dark:text-gray-400 text-gray-500 mb-3 flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Atualizações</span>
            </h3>
            <div className="space-y-1">
              {changelog.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 py-1.5 px-2 rounded dark:hover:bg-white/5 hover:bg-gray-50 transition-colors">
                  <span className="text-base flex-shrink-0">{entry.emoji}</span>
                  <span className="font-bold text-[10px] dark:text-gray-500 text-gray-400 flex-shrink-0 w-8">
                    {entry.version}
                  </span>
                  <p className="text-[11px] font-medium flex-1 dark:text-gray-300 text-gray-600" style={{ color: entry.color }}>
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 text-center">
            <p className="text-[9px] dark:text-gray-600 text-gray-400">
              ArenaQuiz © 2025
            </p>
          </div>
        </div>
      )}

      {/* Suggestion Modal */}
      {showSuggestions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="dark:bg-[#0e0e1a] bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border dark:border-purple-500/20 border-gray-200"
            style={{ animation: "scale-in 0.2s ease-out" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Sugestões</span>
              </h2>
              <button onClick={() => setShowSuggestions(false)} className="dark:text-gray-400 text-gray-500 hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="dark:text-gray-400 text-gray-500 text-sm">
              Manda aquela sua ideia louca pra nós!
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-500 mb-1">Seu nome/apelido</label>
                <input type="text" value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="Como quer ser chamado?" maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 dark:border-purple-500/20 border-gray-200 border-2 focus:border-purple-500 focus:outline-none transition-colors text-sm"
                  disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-500 mb-1">Sua sugestão</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyPress}
                  placeholder="Escreva sua sugestão... (Ctrl+Enter para enviar)" rows={4} maxLength={500}
                  className="w-full px-4 py-2.5 rounded-xl dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 dark:border-purple-500/20 border-gray-200 border-2 focus:border-purple-500 focus:outline-none transition-colors resize-none text-sm"
                  disabled={isSubmitting} />
                <div className="text-[10px] dark:text-gray-600 text-gray-400 text-right mt-1">{message.length}/500</div>
              </div>
            </div>
            {feedback && (
              <div className={`p-3 rounded-xl text-xs font-medium ${feedback.type === 'success' ? 'dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-700' : 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-700'}`}>
                {feedback.text}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSuggestions(false)} className="flex-1 px-4 py-2.5 rounded-xl dark:bg-white/5 bg-gray-100 dark:text-gray-300 text-gray-700 font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-sm" disabled={isSubmitting}>
                Cancelar
              </button>
              <button onClick={handleSubmitSuggestion} className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)" }}
                disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes menu-expand {
          from { opacity: 0; transform: translate(-50%, -1rem) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
