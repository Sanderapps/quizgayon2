import { Quiz } from "./types";
import { politicoQuestions } from "./politicoQuestions";

/**
 * Quiz político de eixo ideológico.
 * Tema: vermelho versus azul
 */
export const politicoQuiz: Quiz = {
  id: "politico",
  slug: "politico",
  title: "Seu eixo político",
  description: "Um teste satírico para revelar para que lado seu discurso realmente puxa.",
  emoji: "🗳️",
  
  theme: {
    primaryColor: "#DC2626",      // Vermelho (Comunista)
    secondaryColor: "#2563EB",    // Azul (Capitalista)
    gradient: "linear-gradient(135deg, #2563EB 0%, #DC2626 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #2563EB, #DC2626)"
  },
  
  categories: {
    // 0-49%: eixo liberal-conservador
    low: {
      name: "Capitalista",
      emoji: "🇧🇷",
      titles: [
        { min: 0, max: 2, title: "Mercado Primeiro", emoji: "💰" },
        { min: 3, max: 5, title: "Planilha na Veia", emoji: "💼" },
        { min: 6, max: 8, title: "Liberal de Manual", emoji: "📈" },
        { min: 9, max: 11, title: "Livre Mercado Convicto", emoji: "🏦" },
        { min: 12, max: 14, title: "Meritocracia sem Rodapé", emoji: "🎯" },
        { min: 15, max: 17, title: "Centro com Viés", emoji: "⚖️" },
        { min: 18, max: 20, title: "Conservador Moderado", emoji: "🤝" },
        { min: 21, max: 23, title: "Puxa para a Direita", emoji: "🎯" },
        { min: 24, max: 26, title: "Quase Centro", emoji: "📊" },
        { min: 27, max: 29, title: "Centro em Observação", emoji: "⚪" },
        { min: 30, max: 32, title: "Isento por Esporte", emoji: "🤷" },
        { min: 33, max: 35, title: "Cansado dos Dois Lados", emoji: "😐" },
        { min: 36, max: 38, title: "Indeciso Aplicado", emoji: "🤔" },
        { min: 39, max: 41, title: "Nulo por Princípio", emoji: "🚫" },
        { min: 42, max: 44, title: "Baixa Tensão Política", emoji: "💤" },
        { min: 45, max: 47, title: "Já Está Mudando", emoji: "↗️" },
        { min: 48, max: 49, title: "Na Borda da Esquerda", emoji: "🔄" },
      ],
      phrases: {
        1: "Convicção total de mercado",
        2: "Nação, ordem e disciplina",
        3: "Costume firme, Estado curto",
        4: "Ordem acima do ruído",
        5: "Antiestado por princípio",
        6: "Liberdade econômica como norte",
        7: "Regras simples, intervenção mínima",
        8: "Conservadorismo bem assentado",
        9: "Centro-direita sem culpa",
        10: "Moderação, mas com lado",
        11: "Distância confortável da disputa",
        12: "Cansaço dos dois polos",
        13: "Indecisão com método",
        14: "Desengajamento por convicção",
        15: "Baixa voltagem política",
        16: "Alguma abertura já apareceu",
        17: "Borda ideológica em movimento",
        18: "Revisando certezas antigas",
        19: "Mudança em observação",
        20: "Virada possível no horizonte"
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
    // 50-100%: eixo progressista
    high: {
      name: "Progressista",
      emoji: "☭",
      titles: [
        { min: 50, max: 52, title: "Começou a Virada", emoji: "👀" },
        { min: 53, max: 55, title: "Esquerda Curiosa", emoji: "🤔" },
        { min: 56, max: 58, title: "Progressista em Treino", emoji: "📚" },
        { min: 59, max: 61, title: "Puxa para a Esquerda", emoji: "↖️" },
        { min: 62, max: 64, title: "Centro-Esquerda", emoji: "🤝" },
        { min: 65, max: 67, title: "Progressista Moderado", emoji: "📖" },
        { min: 68, max: 70, title: "Social-Democrata", emoji: "🌹" },
        { min: 71, max: 73, title: "Esquerda Assumida", emoji: "❤️" },
        { min: 74, max: 76, title: "Convicção de Assembleia", emoji: "✊" },
        { min: 77, max: 79, title: "Progressista Sem Intervalo", emoji: "🚩" },
        { min: 80, max: 82, title: "Coletivo em Primeiro Lugar", emoji: "☭" },
        { min: 83, max: 85, title: "Militância de Carteira", emoji: "📛" },
        { min: 86, max: 88, title: "Companheiro de Linha de Frente", emoji: "✊" },
        { min: 89, max: 91, title: "Revolução em Multitarefa", emoji: "🛋️" },
        { min: 92, max: 94, title: "Teoria e Panfleto", emoji: "🚩" },
        { min: 95, max: 97, title: "Convicção Vermelha", emoji: "☭" },
        { min: 98, max: 100, title: "Palanque em Chamas", emoji: "🔴" },
      ],
      phrases: {
        1: "Virada ideológica iniciada",
        2: "Curiosidade real sobre igualdade",
        3: "Repertório em expansão",
        4: "Inclinação clara à esquerda",
        5: "Centro-esquerda confortável",
        6: "Progressismo bem organizado",
        7: "Social-democracia como casa",
        8: "Afeto político assumido",
        9: "Convicção de assembleia",
        10: "Progressismo sem intervalo",
        11: "Coletivo acima do improviso",
        12: "Militância com método",
        13: "Linha de frente no discurso",
        14: "Debate constante em várias frentes",
        15: "Esquerda assumida sem rodeio",
        16: "Convicção vermelha bem firmada",
        17: "Mobilização virou identidade",
        18: "Antifascismo como idioma",
        19: "Direito humano como base",
        20: "Igualdade social como eixo total"
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
