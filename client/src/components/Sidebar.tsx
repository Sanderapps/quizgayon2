import { useState } from "react";

interface SidebarProps {
  onNavigate?: (page: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: "🏠", label: "Início", page: "home" },
    { icon: "🎮", label: "Jogar Quiz", page: "quiz" },
    { icon: "🏆", label: "Placar", page: "leaderboard" },
    { icon: "💬", label: "Chat Global", page: "chat" },
    { icon: "📊", label: "Estatísticas", page: "stats" },
    { icon: "⚙️", label: "Configurações", page: "settings" },
    { icon: "👮", label: "Admin", page: "admin" },
    { icon: "📻", label: "Admin Rádio", page: "admin-radio" },
    { icon: "ℹ️", label: "Sobre", page: "about" },
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
    
    if (page === "admin-radio") {
      window.location.href = "/admin-radio";
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
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }

        .sidebar-enter {
          animation: slideIn 0.3s ease-out forwards;
        }

        .sidebar-exit {
          animation: slideOut 0.3s ease-in forwards;
        }

        .sidebar-closed {
          transform: translateX(-100%);
        }
      `}</style>

      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Botão Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl hover:scale-110 active:scale-95 transition-transform"
            aria-label="Menu"
          >
            ☰
          </button>

          {/* Logo/Título */}
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">🌈</span>
            Quiz Gayôn
          </h1>

          {/* Spacer para centralizar título */}
          <div className="w-8"></div>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 ${
          isOpen ? "sidebar-enter" : "sidebar-closed"
        }`}
      >
        {/* Header do Sidebar */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white text-xl hover:bg-white/20 rounded px-2"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.page}>
                <button
                  onClick={() => handleItemClick(item.page)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-pink-100 dark:hover:bg-gray-700 transition-colors text-left group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer do Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Quiz Gayôn v2.0
            <br />
            © 2025
          </p>
        </div>
      </aside>
    </>
  );
}
