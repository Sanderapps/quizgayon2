import { useState, useEffect } from "react";
import { changelog } from "@/data/changelog";

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
    { icon: "🏠", page: "home", label: "Início" },
    { icon: "🎮", page: "quiz", label: "Jogar" },
    { icon: "🏆", page: "leaderboard", label: "Placar" },
    { icon: "💬", page: "chat", label: "Chat" },
    { icon: "👮", page: "admin", label: "Admin" },
  ];

  const handleItemClick = (page: string) => {
    if (page === "chat") {
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
        const error = await response.json();
        setFeedback({ type: 'error', text: error.error || 'Erro ao enviar sugestão' });
      }
    } catch (error) {
      setFeedback({ type: 'error', text: 'Erro de conexão. Tente novamente!' });
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
      {/* Barra Superior Fixa */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Botão Menu (Esquerda) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center text-white text-xl shadow-md"
            aria-label="Menu"
            title="Menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>

          {/* Logo/Título (Centro) */}
          <h1 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
            <span>🌈</span>
            <span className="hidden sm:inline">QuizGayon</span>
          </h1>

          {/* Botões de Ação (Direita) */}
          <div className="flex items-center gap-2">
            {/* Botão Sugestões */}
            <button
              onClick={() => setShowSuggestions(true)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center text-white text-xl shadow-md"
              aria-label="Sugestões"
              title="Enviar sugestão"
            >
              💡
            </button>

            {/* Botão Tema */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center text-white text-xl shadow-md"
              aria-label="Alternar tema"
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed top-16 left-4 z-[60] w-[90%] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden dropdown-menu">
          {/* Seção: Menu de Navegação */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">
              🌈 Navegação
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleItemClick(item.page)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-pink-100 dark:hover:bg-gray-700 transition-all group"
                  title={item.label}
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">
                    {item.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Seção: Changelog */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 max-h-56 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span>📋</span>
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
                    className="text-xs font-medium flex-1"
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
                <span>💡</span>
                <span>Sugestões</span>
              </h2>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
                aria-label="Fechar"
              >
                ✕
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
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitSuggestion}
                disabled={isSubmitting || !message.trim() || !apelido.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar 💖'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animações CSS */}
      <style>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .dropdown-menu {
          animation: dropdown 0.3s ease-out;
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
