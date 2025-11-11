import { Quiz } from "./types";
import { gayQuestions } from "./gayQuestions";

/**
 * Quiz Gay: Quão Gay Você É?
 * Tema: Arco-íris (Rosa/Roxo)
 */
export const gayQuiz: Quiz = {
  id: "gay",
  slug: "gay",
  title: "🌈 Quão Gay Você É?",
  description: "Descubra seu nível de gaynice com este quiz divertido! De Hétero Raiz a Viado Divino Transcendental.",
  emoji: "🌈",
  
  theme: {
    primaryColor: "#FF69B4",      // Rosa
    secondaryColor: "#9B59B6",    // Roxo
    gradient: "linear-gradient(135deg, #FF69B4 0%, #9B59B6 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #FF69B4, #9B59B6)"
  },
  
  categories: {
    // 0-49%: Hétero/Menos Gay
    low: {
      name: "Hétero",
      emoji: "💪",
      titles: [
        { min: 0, max: 2, title: "Homão da Poha", emoji: "💪" },
        { min: 3, max: 5, title: "Macho Alfa (SQN)", emoji: "🦁" },
        { min: 6, max: 8, title: "Hétero Top Curioso", emoji: "😎" },
        { min: 9, max: 11, title: "Galã Raiz", emoji: "🏋️" },
        { min: 12, max: 14, title: "\"Não sou gay, mas...\"", emoji: "👀" },
        { min: 15, max: 17, title: "Brother Aliado", emoji: "🤝" },
        { min: 18, max: 20, title: "Sensível Moderno", emoji: "🎯" },
        { min: 21, max: 23, title: "Estiloso Descolado", emoji: "🕶️" },
        { min: 24, max: 26, title: "Metrossexual Raiz", emoji: "💇" },
        { min: 27, max: 29, title: "Dançarino nas Horas Vagas", emoji: "🎵" },
        { min: 30, max: 32, title: "Filósofo de Boteco", emoji: "🍺" },
        { min: 33, max: 35, title: "Conselheiro do Rolê", emoji: "🎱" },
        { min: 36, max: 38, title: "Zen Master", emoji: "🧘" },
        { min: 39, max: 41, title: "Influencer Raiz", emoji: "📱" },
        { min: 42, max: 44, title: "Daniela Mercury", emoji: "⚖️" },
        { min: 45, max: 47, title: "Ney Matogrosso", emoji: "🌈" },
        { min: 48, max: 49, title: "Glória Groove", emoji: "🎵" },
      ],
      phrases: {
        1: "Machão raiz! 💪",
        2: "Hétero top! 🦁",
        3: "Galã confirmado! 😎",
        4: "Brother aliado! 🤝",
        5: "Estiloso demais! 🕶️",
        6: "Metrossexual raiz! 💇",
        7: "Dançarino nato! 🎵",
        8: "Filósofo de boteco! 🍺",
        9: "Conselheiro do rolê! 🎱",
        10: "Zen master! 🧘",
        11: "Influencer raiz! 📱",
        12: "Daniela Mercury! ⚖️",
        13: "Ney Matogrosso! 🌈",
        14: "Glória Groove! 🎵",
        15: "Quase lá! 👀",
        16: "Evoluindo! 📈",
        17: "Mudando! 🔄",
        18: "Descobrindo! 🤔",
        19: "Explorando! 🗺️",
        20: "Abrindo a mente! 🧠"
      },
      icons: {
        1: "💪",
        2: "🦁",
        3: "😎",
        4: "🏋️",
        5: "👀",
        6: "🤝",
        7: "🎯",
        8: "🕶️",
        9: "💇",
        10: "🎵",
        11: "🍺",
        12: "🎱",
        13: "🧘",
        14: "📱",
        15: "⚖️",
        16: "🌈",
        17: "🎵",
        18: "🎹",
        19: "🦚",
        20: "💃"
      }
    },
    // 50-100%: Gay/Mais Gay
    high: {
      name: "Gay",
      emoji: "🌈",
      titles: [
        { min: 50, max: 52, title: "Dono(a) do Open Bar", emoji: "🎹" },
        { min: 53, max: 55, title: "Linn da Quebrada", emoji: "🦚" },
        { min: 56, max: 58, title: "Profissional do Bate-Cabelo", emoji: "💃" },
        { min: 59, max: 61, title: "Lacre com Firma Reconhecida", emoji: "👑" },
        { min: 62, max: 64, title: "Robocop Gay", emoji: "🤖" },
        { min: 65, max: 67, title: "Perigo Ambulante", emoji: "💗" },
        { min: 68, max: 70, title: "Pabllo Vittar", emoji: "😏" },
        { min: 71, max: 73, title: "CEO do Lacre", emoji: "✨" },
        { min: 74, max: 76, title: "Doutorado em Shade", emoji: "👠" },
        { min: 77, max: 79, title: "Monumento do Vale", emoji: "💅" },
        { min: 80, max: 82, title: "Patrimônio Queer", emoji: "🎭" },
        { min: 83, max: 85, title: "Apoteose do Deboche", emoji: "😈" },
        { min: 86, max: 88, title: "Entidade Cósmica", emoji: "👸" },
        { min: 89, max: 91, title: "RuPaul (Versão BR)", emoji: "🦄" },
        { min: 92, max: 94, title: "Beyoncé de Taubaté", emoji: "🎩" },
        { min: 95, max: 97, title: "Ameaça Global", emoji: "🎤" },
        { min: 98, max: 100, title: "Viado Divino Transcendental", emoji: "😇" },
      ],
      phrases: {
        1: "Dono do open bar! 🎹",
        2: "Linn da Quebrada! 🦚",
        3: "Profissional do bate-cabelo! 💃",
        4: "Lacre com firma reconhecida! 👑",
        5: "Robocop gay! 🤖",
        6: "Perigo ambulante! 💗",
        7: "Pabllo Vittar! 😏",
        8: "CEO do lacre! ✨",
        9: "Doutorado em shade! 👠",
        10: "Monumento do Vale! 💅",
        11: "Patrimônio queer! 🎭",
        12: "Apoteose do deboche! 😈",
        13: "Entidade cósmica! 👸",
        14: "RuPaul versão BR! 🦄",
        15: "Beyoncé de Taubaté! 🎩",
        16: "Ameaça global! 🎤",
        17: "Viado divino! 😇",
        18: "Lacrou tudo! 💋",
        19: "Arrasou! 💅",
        20: "Diva suprema! 👑"
      },
      icons: {
        1: "🎹",
        2: "🦚",
        3: "💃",
        4: "👑",
        5: "🤖",
        6: "💗",
        7: "😏",
        8: "✨",
        9: "👠",
        10: "💅",
        11: "🎭",
        12: "😈",
        13: "👸",
        14: "🦄",
        15: "🎩",
        16: "🎤",
        17: "😇",
        18: "💋",
        19: "🌈",
        20: "✨"
      }
    }
  },
  
  questions: gayQuestions
};
