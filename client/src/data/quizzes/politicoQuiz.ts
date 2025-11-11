import { Quiz } from "./types";

/**
 * Quiz Político: Lulista vs Bolsonarista
 * TODO: Implementar perguntas e configurações
 */
export const politicoQuiz: Quiz = {
  id: "politico",
  slug: "politico",
  title: "Lulista ou Bolsonarista?",
  description: "Descubra seu posicionamento político neste quiz polêmico!",
  emoji: "🗳️",
  
  theme: {
    primaryColor: "#DC2626",
    secondaryColor: "#2563EB",
    gradient: "linear-gradient(135deg, #DC2626 0%, #2563EB 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #DC2626, #2563EB)"
  },
  
  categories: {
    low: {
      name: "Bolsonarista",
      emoji: "🇧🇷",
      titles: [],
      phrases: {},
      icons: {}
    },
    high: {
      name: "Lulista",
      emoji: "❤️",
      titles: [],
      phrases: {},
      icons: {}
    }
  },
  
  questions: []
};
