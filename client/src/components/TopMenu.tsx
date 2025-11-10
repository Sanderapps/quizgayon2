import { useState } from "react";
import { changelog } from "@/data/changelog";

interface TopMenuProps {
  onNavigate?: (page: string) => void;
}

export function TopMenu({ onNavigate }: TopMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      {/* Botão circular no topo central */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-14 h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center text-2xl border-2 border-white/50 dark:border-gray-700"
        aria-label="Menu"
        title="Menu"
      >
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          {isOpen ? '✕' : '☰'}
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed top-20 left-1/2 z-[60] w-[90%] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden" style={{animation: 'dropdown 0.3s ease-out', transform: 'translateX(-50%)'}}>
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
                    className="text-xs font-medium truncate flex-1"
                    style={{ color: entry.color }}
                    title={entry.text}
                  >
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Seção: Créditos */}
          <div className="p-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            <div className="text-center text-white">
              <p className="text-sm font-medium mb-1">
                👤 Desenvolvido por
              </p>
              <p className="text-2xl font-bold">
                Sandev
              </p>
              <p className="text-xs mt-2 opacity-80">
                © 2025 Quiz Gayôn
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animação CSS */}
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
      `}</style>
    </>
  );
}
