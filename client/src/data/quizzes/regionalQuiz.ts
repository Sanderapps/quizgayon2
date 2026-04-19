import { Quiz } from "./types";
import { regionalQuestions } from "./regionalQuestions";

/**
 * Quiz regional de sotaque afetivo.
 * Tema: azul versus laranja
 */
export const regionalQuiz: Quiz = {
  id: "regional",
  slug: "regional",
  title: "Seu sotaque afetivo",
  description: "Um quiz bem-humorado para descobrir qual sotaque afetivo fala mais alto.",
  emoji: "🗺️",
  
  theme: {
    primaryColor: "#3B82F6",      // Azul
    secondaryColor: "#F97316",    // Laranja
    gradient: "linear-gradient(135deg, #3B82F6 0%, #F97316 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #3B82F6, #F97316)"
  },
  
  categories: {
    // 0-49%: puxa para o Sul
    low: {
      name: "Sulista",
      emoji: "🧉",
      titles: [
        { min: 0, max: 2, title: "Sul no Modo Padrão", emoji: "🧉" },
        { min: 3, max: 5, title: "Turista da Serra", emoji: "🏔️" },
        { min: 6, max: 8, title: "Mesa Posta do Sul", emoji: "🌭" },
        { min: 9, max: 11, title: "Chimarrão com Método", emoji: "🧉" },
        { min: 12, max: 14, title: "Quase um Guri", emoji: "👦" },
        { min: 15, max: 17, title: "Fã Oficial do Frio", emoji: "🥶" },
        { min: 18, max: 20, title: "CTG no Radar", emoji: "🤠" },
        { min: 21, max: 23, title: "Churrasco com Agenda", emoji: "🍖" },
        { min: 24, max: 26, title: "Bah com Fluência", emoji: "🗣️" },
        { min: 27, max: 29, title: "Defensor do Sagu", emoji: "🍮" },
        { min: 30, max: 32, title: "Especialista em Pinhão", emoji: "🌲" },
        { min: 33, max: 35, title: "Diplomata de Grenal", emoji: "⚽" },
        { min: 36, max: 38, title: "Pilcha sem Improviso", emoji: "👖" },
        { min: 39, max: 41, title: "Tradição em Pessoa", emoji: "🔥" },
        { min: 42, max: 44, title: "Orgulho do Pampa", emoji: "🐴" },
        { min: 45, max: 47, title: "Gaúcho Convicto", emoji: "💪" },
        { min: 48, max: 49, title: "Lenda do Pampa", emoji: "🐴" },
      ],
      phrases: {
        1: "Bah no modo automático",
        2: "Tri natural no vocabulário",
        3: "Capaz de manual",
        4: "Espanto com sotaque próprio",
        5: "Clima de serra bem instalado",
        6: "Frio como patrimônio pessoal",
        7: "Butiá metafórico no bolso",
        8: "Expressão local bem calibrada",
        9: "Sol, banco e conversa comprida",
        10: "Lanche de estádio no coração",
        11: "Churrasco como calendário",
        12: "Frio sério e bem-vindo",
        13: "Tradição com brilho no olho",
        14: "Provérbio pronto para uso",
        15: "Gaúchice em fase avançada",
        16: "Ironia seca e boa",
        17: "Afeto discreto, mas firme",
        18: "Rotina bem assentada",
        19: "Tudo no prumo",
        20: "Sul dominante sem dúvida"
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
    // 50-100%: puxa para o Nordeste
    high: {
      name: "Nordestino",
      emoji: "🌵",
      titles: [
        { min: 50, max: 52, title: "Turista com Ritmo", emoji: "🏖️" },
        { min: 53, max: 55, title: "Afeto em Forma de Cuscuz", emoji: "🥣" },
        { min: 56, max: 58, title: "Forró sem Convite", emoji: "💃" },
        { min: 59, max: 61, title: "Água de Coco na Mão", emoji: "🥥" },
        { min: 62, max: 64, title: "Quase Cabra da Peste", emoji: "🐐" },
        { min: 65, max: 67, title: "Quadrilha com Técnica", emoji: "🌽" },
        { min: 68, max: 70, title: "Carne de Sol na Veia", emoji: "☀️" },
        { min: 71, max: 73, title: "Oxe com Fluência", emoji: "🗣️" },
        { min: 74, max: 76, title: "Defensor da Macaxeira", emoji: "🥔" },
        { min: 77, max: 79, title: "Bolo de Rolo sem Erro", emoji: "🍥" },
        { min: 80, max: 82, title: "São João o Ano Inteiro", emoji: "🔥" },
        { min: 83, max: 85, title: "Cordel em Estado Natural", emoji: "📜" },
        { min: 86, max: 88, title: "Lampião em Versão Pop", emoji: "🤠" },
        { min: 89, max: 91, title: "Filho de Gonzaga", emoji: "👑" },
        { min: 92, max: 94, title: "Conselho de Mainha", emoji: "❤️" },
        { min: 95, max: 97, title: "Arretado sem Intervalo", emoji: "💪" },
        { min: 98, max: 100, title: "Rei do Sertão", emoji: "🌵" },
      ],
      phrases: {
        1: "Oxe já saiu no reflexo",
        2: "Visse no fechamento da frase",
        3: "Arretado como elogio oficial",
        4: "Massa sem esforço",
        5: "Meu rei no tom certo",
        6: "Mainha e painho no repertório",
        7: "Cabra da peste reconhecido",
        8: "Pantim detectado de longe",
        9: "Rocha afetiva consolidada",
        10: "Chegada na carreira sem aviso",
        11: "Gota serena em circulação",
        12: "Convite sempre aberto",
        13: "Drama nomeado com precisão",
        14: "Calma e acolhimento no sotaque",
        15: "Reação pronta e calorosa",
        16: "Confiança alta na fala",
        17: "Consagrado no tratamento",
        18: "Presença de rua e festa",
        19: "Hospitalidade como idioma",
        20: "Nordeste dominante sem volta"
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
