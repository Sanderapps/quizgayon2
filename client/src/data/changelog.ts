/**
 * Changelog do Quiz Gayôn
 * 
 * Este arquivo contém o histórico de atualizações do projeto.
 * Você pode editar livremente adicionando novas versões, emojis e cores personalizadas.
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  emoji: string;
  color: string;
  text: string;
}

export const changelog: ChangelogEntry[] = [
  {
    version: "v2.1",
    date: "2025-01-10",
    emoji: "🎨",
    color: "#FF6B9D",
    text: "Novo menu dropdown circular e melhorias de contraste no dark mode"
  },
  {
    version: "v2.0",
    date: "2025-01-09",
    emoji: "🚀",
    color: "#9D4EDD",
    text: "Refatoração do backend: sistema anti-spam modularizado"
  },
  {
    version: "v1.9",
    date: "2025-01-08",
    emoji: "💡",
    color: "#FFD60A",
    text: "Botão de sugestões com backend completo"
  },
  {
    version: "v1.8",
    date: "2025-01-07",
    emoji: "🌈",
    color: "#06FFA5",
    text: "Categorias mais masculinas para 0-40% e modo escuro elegante"
  },
  {
    version: "v1.7",
    date: "2025-01-05",
    emoji: "🔧",
    color: "#4CC9F0",
    text: "Fix do toggle de tema e notificações de chat"
  },
  {
    version: "v1.6",
    date: "2025-01-03",
    emoji: "💬",
    color: "#F72585",
    text: "Sistema de chat em tempo real com Socket.IO"
  },
  {
    version: "v1.5",
    date: "2024-12-28",
    emoji: "🏆",
    color: "#7209B7",
    text: "Placar de líderes com rankings separados (Divas e Alfas)"
  },
  {
    version: "v1.0",
    date: "2024-12-20",
    emoji: "🎉",
    color: "#560BAD",
    text: "Lançamento inicial do Quiz Gayôn!"
  },
];
