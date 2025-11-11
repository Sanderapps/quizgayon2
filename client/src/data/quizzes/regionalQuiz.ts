import { Quiz } from "./types";
import { regionalQuestions } from "./regionalQuestions";

/**
 * Quiz Regional: Sulista vs Nordestino
 * Tema: Azul (Sul) vs Laranja (Nordeste)
 */
export const regionalQuiz: Quiz = {
  id: "regional",
  slug: "regional",
  title: "Sulista ou Nordestino?",
  description: "Descubra se sua alma é mais do pampa ou do sertão!",
  emoji: "🗺️",
  
  theme: {
    primaryColor: "#3B82F6",      // Azul
    secondaryColor: "#F97316",    // Laranja
    gradient: "linear-gradient(135deg, #3B82F6 0%, #F97316 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #3B82F6, #F97316)"
  },
  
  categories: {
    // 0-49%: Sulista
    low: {
      name: "Sulista",
      emoji: "🧉",
      titles: [
        { min: 0, max: 2, title: "Gaúcho de Apartamento", emoji: "🧉" },
        { min: 3, max: 5, title: "Turista da Serra", emoji: "🏔️" },
        { min: 6, max: 8, title: "Fã de Cuca com Linguiça", emoji: "🌭" },
        { min: 9, max: 11, title: "Tomador de Chimarrão Nutella", emoji: "🧉" },
        { min: 12, max: 14, title: "Quase um Guri", emoji: "👦" },
        { min: 15, max: 17, title: "Entusiasta do Frio", emoji: "🥶" },
        { min: 18, max: 20, title: "Frequentador de CTG", emoji: "🤠" },
        { min: 21, max: 23, title: "Mestre do Churrasco de Fim de Semana", emoji: "🍖" },
        { min: 24, max: 26, title: "Fluente em \"Bah\" e \"Tchê\"", emoji: "🗣️" },
        { min: 27, max: 29, title: "Defensor do Sagu", emoji: "🍮" },
        { min: 30, max: 32, title: "Especialista em Pinhão", emoji: "🌲" },
        { min: 33, max: 35, title: "Rei do Grenal", emoji: "⚽" },
        { min: 36, max: 38, title: "Pilchado no Nível Máximo", emoji: "👖" },
        { min: 39, max: 41, title: "Herdeiro da Tradição Farroupilha", emoji: "🔥" },
        { min: 42, max: 44, title: "Separatista Convencido", emoji: "😂" },
        { min: 45, max: 47, title: "Gaúcho Raiz", emoji: "💪" },
        { min: 48, max: 49, title: "A própria Lenda do Pampa", emoji: "🐴" },
      ],
      phrases: {
        1: "Bah, guri!",
        2: "Tri legal!",
        3: "Capaz!",
        4: "Que barbaridade!",
        5: "Coisa de louco!",
        6: "Bem capaz!",
        7: "Me caiu os butiá do bolso!",
        8: "De renguear cusco!",
        9: "Lagarteando no sol!",
        10: "Um pão com vina!",
        11: "Churrasco de igreja!",
        12: "Frio de rachar!",
        13: "Mais faceiro que guri de bombacha nova!",
        14: "A cavalo dado não se olha os dentes!",
        15: "Se benze, guri!",
        16: "Não te faz de salame!",
        17: "Amigo do peito!",
        18: "É o que tem pra hoje!",
        19: "De primeira!",
        20: "Feito!"
      },
      icons: {
        1: "🧉",
        2: "🏔️",
        3: "🌭",
        4: "🥶",
        5: "🤠",
        6: "🍖",
        7: "🗣️",
        8: "🍮",
        9: "🌲",
        10: "⚽",
        11: "👖",
        12: "🔥",
        13: "😂",
        14: "💪",
        15: "🐴",
        16: "🍇",
        17: "🍎",
        18: "🍊",
        19: "🍷",
        20: "👢"
      }
    },
    // 50-100%: Nordestino
    high: {
      name: "Nordestino",
      emoji: "🌵",
      titles: [
        { min: 50, max: 52, title: "Turista de Fim de Semana", emoji: "🏖️" },
        { min: 53, max: 55, title: "Amante de Cuscuz", emoji: "🥣" },
        { min: 56, max: 58, title: "Fã de um Forrozinho", emoji: "💃" },
        { min: 59, max: 61, title: "Viciado em Água de Coco", emoji: "🥥" },
        { min: 62, max: 64, title: "Quase um Cabra da Peste", emoji: "🐐" },
        { min: 65, max: 67, title: "Dançarino de Quadrilha", emoji: "🌽" },
        { min: 68, max: 70, title: "Mestre da Carne de Sol", emoji: "☀️" },
        { min: 71, max: 73, title: "Fluente em \"Oxe\" e \"Visse\"", emoji: "🗣️" },
        { min: 74, max: 76, title: "Defensor da Macaxeira", emoji: "🥔" },
        { min: 77, max: 79, title: "Especialista em Bolo de Rolo", emoji: "🍥" },
        { min: 80, max: 82, title: "Rei do São João", emoji: "🔥" },
        { min: 83, max: 85, title: "Poeta do Cordel", emoji: "📜" },
        { min: 86, max: 88, title: "Lampião Moderno", emoji: "🤠" },
        { min: 89, max: 91, title: "Filho de Gonzaga", emoji: "👑" },
        { min: 92, max: 94, title: "Conselheiro de Mainha", emoji: "❤️" },
        { min: 95, max: 97, title: "Nordestino Arretado", emoji: "💪" },
        { min: 98, max: 100, title: "O próprio Rei do Sertão", emoji: "🌵" },
      ],
      phrases: {
        1: "Oxe!",
        2: "Visse!",
        3: "Arretado!",
        4: "Massa!",
        5: "Meu rei!",
        6: "Painho/Mainha!",
        7: "Cabra da peste!",
        8: "Deixe de pantim!",
        9: "É rocheda!",
        10: "Vou chegar na carreira!",
        11: "Tá com a gota serena!",
        12: "Bora!",
        13: "É o cão!",
        14: "Não se avexe não!",
        15: "É de lascar!",
        16: "Pode crer!",
        17: "Meu consagrado!",
        18: "É isso aí!",
        19: "Com certeza!",
        20: "Valeu!"
      },
      icons: {
        1: "🏖️",
        2: "🥣",
        3: "💃",
        4: "🥥",
        5: "🐐",
        6: "🌽",
        7: "☀️",
        8: "🗣️",
        9: "🥔",
        10: "🍥",
        11: "🔥",
        12: "📜",
        13: "🤠",
        14: "👑",
        15: "❤️",
        16: "💪",
        17: "🌵",
        18: "🌶️",
        19: "🫘",
        20: "🩴"
      }
    }
  },
  
  questions: regionalQuestions
};
