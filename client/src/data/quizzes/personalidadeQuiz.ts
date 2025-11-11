import { Quiz } from "./types";

/**
 * Quiz de Personalidade: Introvertido vs Extrovertido
 * TODO: Implementar perguntas e configurações
 */
export const personalidadeQuiz: Quiz = {
  id: "personalidade",
  slug: "personalidade",
  title: "Introvertido ou Extrovertido?",
  description: "Descubra seu tipo de personalidade!",
  emoji: "🧠",
  
  theme: {
    primaryColor: "#7C3AED",
    secondaryColor: "#F59E0B",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #7C3AED, #F59E0B)"
  },
  
  categories: {
    low: {
      name: "Introvertido",
      emoji: "📚",
      titles: [],
      phrases: {},
      icons: {}
    },
    high: {
      name: "Extrovertido",
      emoji: "🎉",
      titles: [],
      phrases: {},
      icons: {}
    }
  },
  
  questions: []
};
