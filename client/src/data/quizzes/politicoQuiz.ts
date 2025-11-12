import { Quiz } from "./types";
import { politicoQuestions } from "./politicoQuestions";

/**
 * Quiz Político: Lulista vs Bolsonarista
 * Tema: Vermelho (Lulista) vs Azul (Bolsonarista)
 */
export const politicoQuiz: Quiz = {
  id: "politico",
  slug: "politico",
  title: "Comunista ou Capitalista?",
  description: "Descubra seu posicionamento econômico-político neste quiz polêmico! De Capitalista Raiz a Comunista Convicto.",
  emoji: "🗳️",
  
  theme: {
    primaryColor: "#DC2626",      // Vermelho (Comunista)
    secondaryColor: "#2563EB",    // Azul (Capitalista)
    gradient: "linear-gradient(135deg, #2563EB 0%, #DC2626 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #2563EB, #DC2626)"
  },
  
  categories: {
    // 0-49%: Capitalista (Azul)
    low: {
      name: "Capitalista",
      emoji: "🇧🇷",
      titles: [
        { min: 0, max: 2, title: "Capitalista Raiz", emoji: "💰" },
        { min: 3, max: 5, title: "Empreendedor Nato", emoji: "💼" },
        { min: 6, max: 8, title: "Liberal Econômico", emoji: "📈" },
        { min: 9, max: 11, title: "Livre Mercado", emoji: "🏦" },
        { min: 12, max: 14, title: "Meritocracia Pura", emoji: "🎯" },
        { min: 15, max: 17, title: "Centro-Direita", emoji: "⚖️" },
        { min: 18, max: 20, title: "Moderado Conservador", emoji: "🤝" },
        { min: 21, max: 23, title: "Centrista Puxando Direita", emoji: "🎯" },
        { min: 24, max: 26, title: "Quase Centro", emoji: "📊" },
        { min: 27, max: 29, title: "Centro Neutro", emoji: "⚪" },
        { min: 30, max: 32, title: "Isentão Raiz", emoji: "🤷" },
        { min: 33, max: 35, title: "Nem Lula Nem Bolsonaro", emoji: "😐" },
        { min: 36, max: 38, title: "Indeciso Profissional", emoji: "🤔" },
        { min: 39, max: 41, title: "Voto Nulo Eterno", emoji: "🚫" },
        { min: 42, max: 44, title: "Apolítico", emoji: "💤" },
        { min: 45, max: 47, title: "Começando a Pender", emoji: "↗️" },
        { min: 48, max: 49, title: "Quase Esquerda", emoji: "🔄" },
      ],
      phrases: {
        1: "Mito sempre! 🇧🇷",
        2: "Brasil acima de tudo 💪",
        3: "Deus, pátria, família 🗿",
        4: "Ordem e progresso 🍺",
        5: "Comunismo nunca 💼",
        6: "Liberdade econômica ⚖️",
        7: "Menos estado, mais Brasil 🤝",
        8: "Conservador nos costumes 🎯",
        9: "Centro-direita raiz 📊",
        10: "Moderado mas firme ⚪",
        11: "Isentão de carteirinha 🤷",
        12: "Nem um nem outro 😐",
        13: "Indeciso crônico 🤔",
        14: "Voto nulo sempre 🚫",
        15: "Política? Não, obrigado 💤",
        16: "Começando a mudar ↗️",
        17: "Quase lá 🔄",
        18: "Pensando melhor 🤔",
        19: "Evoluindo 📈",
        20: "Mudando de lado 🔄"
      },
      icons: {
        1: "🇧🇷",
        2: "💪",
        3: "🗿",
        4: "🍺",
        5: "💼",
        6: "⚖️",
        7: "🤝",
        8: "🎯",
        9: "📊",
        10: "⚪",
        11: "🤷",
        12: "😐",
        13: "🤔",
        14: "🚫",
        15: "💤",
        16: "↗️",
        17: "🔄",
        18: "🤔",
        19: "📈",
        20: "🔄"
      }
    },
    // 50-100%: Lulista (Vermelho)
    high: {
      name: "Comunista",
      emoji: "☭",
      titles: [
        { min: 50, max: 52, title: "Começando a Acordar", emoji: "👀" },
        { min: 53, max: 55, title: "Esquerda Curiosa", emoji: "🤔" },
        { min: 56, max: 58, title: "Progressista Iniciante", emoji: "📚" },
        { min: 59, max: 61, title: "Centrista Puxando Esquerda", emoji: "↖️" },
        { min: 62, max: 64, title: "Centro-Esquerda", emoji: "🤝" },
        { min: 65, max: 67, title: "Moderado Progressista", emoji: "📖" },
        { min: 68, max: 70, title: "Social-Democrata", emoji: "🌹" },
        { min: 71, max: 73, title: "Socialista Assumido", emoji: "❤️" },
        { min: 74, max: 76, title: "Esquerdista Convicto", emoji: "✊" },
        { min: 77, max: 79, title: "Progressista Top", emoji: "🚩" },
        { min: 80, max: 82, title: "Coletivista Raiz", emoji: "☭" },
        { min: 83, max: 85, title: "Militante de Carteirinha", emoji: "📛" },
        { min: 86, max: 88, title: "Companheiro Firmeza", emoji: "✊" },
        { min: 89, max: 91, title: "Revolucionário de Sofá", emoji: "🛋️" },
        { min: 92, max: 94, title: "Marxista Raiz", emoji: "🚩" },
        { min: 95, max: 97, title: "Comunista Convicto", emoji: "☭" },
        { min: 98, max: 100, title: "Revolução Já!", emoji: "🔴" },
      ],
      phrases: {
        1: "Começando a ver a luz 👀",
        2: "Curioso sobre igualdade 🤔",
        3: "Estudando mais 📚",
        4: "Pendendo pra esquerda ↖️",
        5: "Centro-esquerda raiz 🤝",
        6: "Progressista moderado 📖",
        7: "Social-democracia neles 🌹",
        8: "Petista com orgulho ❤️",
        9: "Esquerda convicta ✊",
        10: "Progressista top 🚩",
        11: "Lulista sempre ⭐",
        12: "Militante de verdade 📛",
        13: "Companheiro! ✊",
        14: "Revolução (no Twitter) 🛋️",
        15: "Esquerdista raiz 🚩",
        16: "Militante convicto ⭐",
        17: "Lula Livre! 🔴",
        18: "Fora fascismo! ✊",
        19: "Direitos humanos! 📢",
        20: "Igualdade social! ⭐"
      },
      icons: {
        1: "👀",
        2: "🤔",
        3: "📚",
        4: "↖️",
        5: "🤝",
        6: "📖",
        7: "🌹",
        8: "❤️",
        9: "✊",
        10: "🚩",
        11: "⭐",
        12: "📛",
        13: "✊",
        14: "🛋️",
        15: "🚩",
        16: "⭐",
        17: "🔴",
        18: "✊",
        19: "📢",
        20: "⭐"
      }
    }
  },
  
  questions: politicoQuestions
};
