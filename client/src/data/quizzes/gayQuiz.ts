import { Quiz } from "./types";
import { gayQuestions } from "./gayQuestions";

/**
 * Quiz de presença no rolê.
 * Tema: arco neon (rosa/roxo)
 */
export const gayQuiz: Quiz = {
  id: "gay",
  slug: "gay",
  title: "Seu nível de close",
  description: "Um quiz rápido, debochado e afiado para medir sua presença no rolê.",
  emoji: "🌈",
  
  theme: {
    primaryColor: "#FF69B4",      // Rosa
    secondaryColor: "#9B59B6",    // Roxo
    gradient: "linear-gradient(135deg, #FF69B4 0%, #9B59B6 100%)",
    backgroundGradient: "linear-gradient(to bottom right, #FF69B4, #9B59B6)"
  },
  
  categories: {
    // 0-49%: modo contido
    low: {
      name: "Contido",
      emoji: "💪",
      titles: [
        { min: 0, max: 2, title: "Modo Discreto", emoji: "💪" },
        { min: 3, max: 5, title: "Postura de Camarote", emoji: "🦁" },
        { min: 6, max: 8, title: "Curioso com Método", emoji: "😎" },
        { min: 9, max: 11, title: "Galã de Rotina", emoji: "🏋️" },
        { min: 12, max: 14, title: "Não Costuma, Mas Repara", emoji: "👀" },
        { min: 15, max: 17, title: "Aliado com Timing", emoji: "🤝" },
        { min: 18, max: 20, title: "Sensível Sem Alarde", emoji: "🎯" },
        { min: 21, max: 23, title: "Estilo Bem Resolvido", emoji: "🕶️" },
        { min: 24, max: 26, title: "Vaidade Organizada", emoji: "💇" },
        { min: 27, max: 29, title: "Corpo Solto na Medida", emoji: "🎵" },
        { min: 30, max: 32, title: "Comentador de Canto", emoji: "🍺" },
        { min: 33, max: 35, title: "Conselheiro do Grupo", emoji: "🎱" },
        { min: 36, max: 38, title: "Calma com Presença", emoji: "🧘" },
        { min: 39, max: 41, title: "Protagonismo Moderado", emoji: "📱" },
        { min: 42, max: 44, title: "Ícone em Formação", emoji: "⚖️" },
        { min: 45, max: 47, title: "Performance Natural", emoji: "🌈" },
        { min: 48, max: 49, title: "Quase Patrimônio", emoji: "🎵" },
      ],
      phrases: {
        1: "Postura fechada, presença mínima",
        2: "Convicção de camarote",
        3: "Galã de resposta curta",
        4: "Aliado de confiança",
        5: "Estilo sob controle",
        6: "Vaidade sem anúncio",
        7: "Já dança quando a pista ajuda",
        8: "Comentário bom no tempo certo",
        9: "Leitura fina do ambiente",
        10: "Calma com repertório",
        11: "Sabe sustentar presença",
        12: "Começando a chamar atenção",
        13: "A margem já ficou para trás",
        14: "Charme em expansão",
        15: "Quase no ponto de virada",
        16: "Mudança em curso",
        17: "A presença já apareceu",
        18: "Mais solto do que admite",
        19: "Carisma subindo",
        20: "Porta aberta para o espetáculo"
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
    // 50-100%: presença máxima
    high: {
      name: "Presença",
      emoji: "🌈",
      titles: [
        { min: 50, max: 52, title: "Chegou no Close", emoji: "🎹" },
        { min: 53, max: 55, title: "Presença de Pista", emoji: "🦚" },
        { min: 56, max: 58, title: "Bate-Cabelo com Método", emoji: "💃" },
        { min: 59, max: 61, title: "Presença Registrada", emoji: "👑" },
        { min: 62, max: 64, title: "Leitura de Precisão", emoji: "🤖" },
        { min: 65, max: 67, title: "Perigo em Alta Definição", emoji: "💗" },
        { min: 68, max: 70, title: "Pop Star de Circuito", emoji: "😏" },
        { min: 71, max: 73, title: "Direção Criativa do Rolê", emoji: "✨" },
        { min: 74, max: 76, title: "Ironia com Pós-Graduação", emoji: "👠" },
        { min: 77, max: 79, title: "Monumento de Pista", emoji: "💅" },
        { min: 80, max: 82, title: "Patrimônio da Noite", emoji: "🎭" },
        { min: 83, max: 85, title: "Presença em Estado Puro", emoji: "😈" },
        { min: 86, max: 88, title: "Entidade de Camarim", emoji: "👸" },
        { min: 89, max: 91, title: "Apresenta e Entrega", emoji: "🦄" },
        { min: 92, max: 94, title: "Headliner do Caos", emoji: "🎩" },
        { min: 95, max: 97, title: "Risco ao Equilíbrio Alheio", emoji: "🎤" },
        { min: 98, max: 100, title: "Transcendência de Arena", emoji: "😇" },
      ],
      phrases: {
        1: "Entrou no jogo com firmeza",
        2: "Presença que já organiza o ambiente",
        3: "Pista, timing e confiança",
        4: "Carisma oficialmente assumido",
        5: "Leitura rápida, resposta melhor ainda",
        6: "Impacto alto em qualquer sala",
        7: "Pop no repertório e no gesto",
        8: "Direção criativa do próprio caos",
        9: "Ironia elegante e bem apontada",
        10: "Figura central sem esforço aparente",
        11: "Patrimônio da noite em atividade",
        12: "Nada discreto, tudo preciso",
        13: "Energia de camarim lotado",
        14: "Apresenta, entrega e ainda sobra",
        15: "Headliner natural do evento",
        16: "Presença que desestabiliza a sala",
        17: "Outra categoria de confiança",
        18: "Resultado para print e replay",
        19: "Nível alto de presença confirmada",
        20: "Você não entra, você estreia"
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
