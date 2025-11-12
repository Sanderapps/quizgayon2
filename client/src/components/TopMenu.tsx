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

  // Theme toggle effect
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apelido: apelido.trim(),
          mensagem: message.trim(),
        }),
      });

      if (response.ok) {
        setFeedback({ type: 'success', text: 'Sugestão enviada com sucesso! Obrigado! 💖' });
        setMessage("");
        setApelido("");
        setTimeout(() => {
          setShowSuggestions(false);
          setFeedback(null);
        }, 2000);
      } else {
        const errorData = await response.json();
        setFeedback({ 
          type: 'error', 
          text: errorData.message || 'Erro ao enviar sugestão. Tente novamente.' 
        });
      }
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        text: 'Erro de conexão. Verifique sua internet.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitSuggestion();
    }
  };

  return (
    <>
      {/* Botão Menu Hamburger - Fixo no topo direito */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[70] w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Overlay escuro */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden dropdown-menu-open">
          {/* Seção: Menu de Navegação - 7 colunas integradas */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Navegação</span>
            </h3>
            {/* Grid responsivo: 4 colunas em mobile, 7 em desktop */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.page}
                    onClick={() => handleItemClick(item.page)}
                    className="flex flex-col items-center justify-center transition-all group"
                    title={item.label}
                  >
                    {/* Fundo quadrado arredondado com ícone */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-md hover:shadow-xl hover:scale-110 transition-all">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-300" />
                    </div>
                    {/* Label opcional em telas maiores */}
                    <span className="hidden sm:block text-[10px] mt-1 text-gray-600 dark:text-gray-400 font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção: Changelog */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 max-h-56 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span>Atualizações</span>
            </h3>
            <div className="space-y-1.5">
              {changelog.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{entry.emoji}</span>
                  <span className="font-bold text-xs text-gray-600 dark:text-gray-400 flex-shrink-0 w-10">
                    {entry.version}
                  </span>
                  <p
                    className="text-xs md:text-[13px] font-medium flex-1"
                    style={{ color: entry.color }}
                  >
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé */}
          <footer className="p-3 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-600">
              𝗕𝗼𝗱𝗼𝘀 𝗼𝘀 𝗱𝗶𝗻𝗲𝗶𝘁𝗼𝘀 𝗒𝗻𝗱𝘃 © 2025
            </p>
          </footer>
        </div>
      )}

      {/* Modal de Sugestões */}
      {showSuggestions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                <span>Sugestões</span>
              </h2>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Descrição */}
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Manda aquela sua idéia louca pra nós!
            </p>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seu nome/apelido
                </label>
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  maxLength={30}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sua sugestão
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escreva sua sugestão ou feedback aqui... (Ctrl+Enter para enviar)"
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors resize-none"
                  disabled={isSubmitting}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                  {message.length}/500
                </div>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                feedback.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}>
                {feedback.text}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuggestions(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitSuggestion}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dropdown-menu-open {
          animation: expandFromButton 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: top center;
        }
        
        @keyframes expandFromButton {
          from {
            opacity: 0;
            transform: translate(-50%, -2rem) scale(0.3);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
