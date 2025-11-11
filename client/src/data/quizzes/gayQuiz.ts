import { Quiz } from "./types";

export const gayQuiz: Quiz = {
  id: "gay",
  slug: "gay",
  title: "Quão Gay Você É?",
  description: "Descubra seu nível de gayness com este quiz divertido e sem compromisso!",
  emoji: "🌈",
  
  theme: {
    primaryColor: "#FF1493",
    secondaryColor: "#9333EA",
    gradient: "linear-gradient(135deg, #FF1493 0%, #9333EA 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #FF1493, #9333EA, #3B82F6)"
  },
  
  categories: {
    low: {
      name: "Top Alpha",
      emoji: "💪",
      titles: [],  // Será preenchido depois
      phrases: {},  // Será preenchido depois
      icons: {}     // Será preenchido depois
    },
    high: {
      name: "Top Divas",
      emoji: "👑",
      titles: [],  // Será preenchido depois
      phrases: {},  // Será preenchido depois
      icons: {}     // Será preenchido depois
    }
  },
  
  questions: []  // Será preenchido depois
};
