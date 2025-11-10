import { useState, useEffect, useRef } from "react";
import { salvarPontuacao, buscarPlacar, pontuacaoParaPercentual } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RankBadge } from "@/components/RankBadge";
import { Leaderboard } from "@/components/Leaderboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatWidget } from "@/components/ChatWidget";
import { SuggestionButton } from "@/components/SuggestionButton";
import { TopMenu } from "@/components/TopMenu";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";
import { LoadingSkeleton, CardSkeleton } from "@/components/LoadingSkeleton";
import { useEasterEggs } from "@/hooks/useEasterEggs";
import { HomeEasterEggs, LeaderboardEasterEgg } from "@/components/HomeEasterEggs";

interface Question {
  id: number;
  text: string;
  answers: { text: string; points: number }[];
  nsfw?: boolean;
}

interface Result {
  percentage: number;
  title: string;
  description: string;
  emoji: string;
  badge?: string;
}

interface LeaderEntry {
  name: string;
  percentage: number;
  result: string;
  date: string;
  // Adicionar campos do banco de dados para melhor tipagem, se necessário
  tempo_segundos?: number;
}

const QUESTIONS_POOL: Question[] = [

  // 1-10: Comportamento e Atitude
  {
    id: 1,
    text: "Como você vai à padaria?",
    answers: [
      { text: "🩲 De cueca/sunga mesmo", points: 0 },
      { text: "👕 Qualquer trapo velho", points: 1 },
      { text: "👔 Troco de roupa rápido", points: 2 },
      { text: "👗 Escolho roupa com cuidado", points: 3 },
      { text: "💃 Monto look completo com acessórios", points: 4 },
    ],
  },
  {
    id: 2,
    text: "Qual seu shampoo?",
    answers: [
      { text: "🧼 Sabonete serve pra tudo", points: 0 },
      { text: "🚿 Shampoo 3 em 1", points: 1 },
      { text: "💆 Shampoo e condicionador", points: 2 },
      { text: "✨ Produtos específicos pro meu cabelo", points: 3 },
      { text: "💅 Rotina completa de skincare", points: 4 },
    ],
  },
  {
    id: 3,
    text: "Como você fala?",
    answers: [
      { text: "💪 Mano, véi, brother", points: 0 },
      { text: "🗣️ Cara, tipo assim", points: 1 },
      { text: "😐 Falo normal", points: 2 },
      { text: "💁 Amiga, querida", points: 3 },
      { text: "💋 Lacrou, arrasa, diva", points: 4 },
    ],
  },
  {
    id: 4,
    text: "Reação a um elogio:",
    answers: [
      { text: "😳 Fico sem graça, não sei responder", points: 0 },
      { text: "👍 Falo 'valeu' e pronto", points: 1 },
      { text: "😊 Agradeço educadamente", points: 2 },
      { text: "💁 Agradeço e faço pose", points: 3 },
      { text: "👑 Já sabia, mas obrigado!", points: 4 },
    ],
  },
  {
    id: 5,
    text: "Sua bebida preferida:",
    answers: [
      { text: "🍺 Cerveja gelada", points: 0 },
      { text: "🥃 Whisky puro", points: 1 },
      { text: "🍹 Drink qualquer", points: 2 },
      { text: "🍸 Gin tônica", points: 3 },
      { text: "🌈 Drink colorido com guarda-chuva", points: 4 },
    ],
  },
  {
    id: 6,
    text: "Assunto de conversa:",
    answers: [
      { text: "⚽ Futebol, carro, cerveja", points: 0 },
      { text: "💼 Trabalho, política", points: 1 },
      { text: "🎬 Filmes, séries", points: 2 },
      { text: "👗 Fofoca, moda", points: 3 },
      { text: "👑 RuPaul, Beyoncé, lacração", points: 4 },
    ],
  },
  {
    id: 7,
    text: "Como você chora:",
    answers: [
      { text: "😤 Homem não chora", points: 0 },
      { text: "⚰️ Só em velório", points: 1 },
      { text: "😢 Às vezes, sozinho", points: 2 },
      { text: "😭 Choro vendo filme", points: 3 },
      { text: "💦 Choro por qualquer coisa", points: 4 },
    ],
  },
  {
    id: 8,
    text: "Reação ao ver aranha:",
    answers: [
      { text: "✋ Pego com a mão e jogo fora", points: 0 },
      { text: "👞 Mato com chinelo", points: 1 },
      { text: "📞 Chamo alguém para matar", points: 2 },
      { text: "😱 Grito e subo na cadeira", points: 3 },
      { text: "🏃 Saio correndo e gritando", points: 4 },
    ],
  },
  {
    id: 9,
    text: "Como você dança:",
    answers: [
      { text: "🧍 Fico parado no canto", points: 0 },
      { text: "🕺 Só se tiver muito bêbado", points: 1 },
      { text: "💃 Danço normal", points: 2 },
      { text: "🎉 Danço todas as músicas", points: 3 },
      { text: "✨ Sou o centro da pista", points: 4 },
    ],
  },
  {
    id: 10,
    text: "Sua cor favorita:",
    answers: [
      { text: "⚫ Preto", points: 0 },
      { text: "🔵 Azul escuro", points: 1 },
      { text: "🟢 Verde", points: 2 },
      { text: "🟣 Roxo", points: 3 },
      { text: "🌈 Rosa choque", points: 4 },
    ],
  },

  // 11-20: Cultura Pop e Entretenimento
  {
    id: 11,
    text: "Sua série favorita:",
    answers: [
      { text: "🎬 Breaking Bad", points: 0 },
      { text: "🔫 Peaky Blinders", points: 1 },
      { text: "👑 Game of Thrones", points: 2 },
      { text: "💄 Euphoria", points: 3 },
      { text: "👸 RuPaul's Drag Race", points: 4 },
    ],
  },
  {
    id: 12,
    text: "Filme que você ama:",
    answers: [
      { text: "💥 Velozes e Furiosos", points: 0 },
      { text: "🦇 Batman", points: 1 },
      { text: "🌌 Star Wars", points: 2 },
      { text: "💕 La La Land", points: 3 },
      { text: "👠 Priscilla, A Rainha do Deserto", points: 4 },
    ],
  },
  {
    id: 13,
    text: "Sua opinião sobre BBB:",
    answers: [
      { text: "📺 Não assisto essa porcaria", points: 0 },
      { text: "🤷 Não me interessa", points: 1 },
      { text: "👀 Vejo os memes", points: 2 },
      { text: "📱 Assisto quando dá", points: 3 },
      { text: "🔥 Sou fã, voto todo dia", points: 4 },
    ],
  },
  {
    id: 14,
    text: "Beyoncé é:",
    answers: [
      { text: "🎤 Cantora normal", points: 0 },
      { text: "👍 Boa cantora", points: 1 },
      { text: "⭐ Muito talentosa", points: 2 },
      { text: "👑 Rainha", points: 3 },
      { text: "🙏 Deusa suprema", points: 4 },
    ],
  },
  {
    id: 15,
    text: "Lady Gaga é:",
    answers: [
      { text: "🎵 Cantora ok", points: 0 },
      { text: "🎶 Tem umas músicas boas", points: 1 },
      { text: "⭐ Muito talentosa", points: 2 },
      { text: "👸 Ícone pop", points: 3 },
      { text: "🌟 Minha mãe espiritual", points: 4 },
    ],
  },
  {
    id: 16,
    text: "Pabllo Vittar:",
    answers: [
      { text: "❌ Não conheço", points: 0 },
      { text: "🤔 Já ouvi falar", points: 1 },
      { text: "🎵 Tem umas músicas boas", points: 2 },
      { text: "💃 Amo as músicas", points: 3 },
      { text: "👑 É a rainha do Brasil", points: 4 },
    ],
  },
  {
    id: 17,
    text: "Anitta é:",
    answers: [
      { text: "🙄 Superestimada", points: 0 },
      { text: "🎤 Cantora ok", points: 1 },
      { text: "💃 Muito talentosa", points: 2 },
      { text: "🌎 Orgulho nacional", points: 3 },
      { text: "👑 Rainha da América Latina", points: 4 },
    ],
  },
  {
    id: 18,
    text: "Sua reação a fofoca:",
    answers: [
      { text: "😒 Não ligo", points: 0 },
      { text: "🤷 Tanto faz", points: 1 },
      { text: "👂 Escuto se for interessante", points: 2 },
      { text: "☕ Adoro ouvir", points: 3 },
      { text: "📢 Sou o centro da fofoca", points: 4 },
    ],
  },
  {
    id: 19,
    text: "Astrologia é:",
    answers: [
      { text: "🔭 Bobagem", points: 0 },
      { text: "🤷 Não acredito", points: 1 },
      { text: "⭐ Interessante", points: 2 },
      { text: "🌙 Acredito sim", points: 3 },
      { text: "✨ Meu mapa astral explica tudo", points: 4 },
    ],
  },
  {
    id: 20,
    text: "Seu emoji mais usado:",
    answers: [
      { text: "👍", points: 0 },
      { text: "😂", points: 1 },
      { text: "❤️", points: 2 },
      { text: "💅", points: 3 },
      { text: "💋", points: 4 },
    ],
  },

  // 21-30: Situações do Dia a Dia
  {
    id: 21,
    text: "Pneu furado:",
    answers: [
      { text: "🔧 Troco sozinho", points: 0 },
      { text: "📞 Chamo alguém pra ajudar", points: 1 },
      { text: "🚗 Ligo pro guincho", points: 2 },
      { text: "😰 Entro em pânico", points: 3 },
      { text: "💅 Nem sei onde fica o estepe", points: 4 },
    ],
  },
  {
    id: 22,
    text: "Barata na cozinha:",
    answers: [
      { text: "🔥 Toco fogo", points: 0 },
      { text: "👞 Mato com chinelo", points: 1 },
      { text: "😰 Chamo alguém", points: 2 },
      { text: "😱 Grito e saio correndo", points: 3 },
      { text: "🏃 Mudo de casa", points: 4 },
    ],
  },
  {
    id: 23,
    text: "Como você tira selfie:",
    answers: [
      { text: "🤳 Rápido e sem pose", points: 0 },
      { text: "📸 Normal, sem frescura", points: 1 },
      { text: "😊 Com um sorriso", points: 2 },
      { text: "💁 Várias poses e ângulos", points: 3 },
      { text: "✨ Sessão de fotos completa", points: 4 },
    ],
  },
  {
    id: 24,
    text: "Filhote de cachorro:",
    answers: [
      { text: "👍 Bonitinho", points: 0 },
      { text: "😊 Que fofo", points: 1 },
      { text: "🥰 Amo cachorrinhos", points: 2 },
      { text: "😍 Quero pegar no colo", points: 3 },
      { text: "💕 Derrete meu coração", points: 4 },
    ],
  },
  {
    id: 25,
    text: "Presente que não gostou:",
    answers: [
      { text: "😒 Falo na cara", points: 0 },
      { text: "🤷 Deixo de lado", points: 1 },
      { text: "😊 Agradeço mesmo assim", points: 2 },
      { text: "💕 Agradeço efusivamente", points: 3 },
      { text: "🎭 Finjo que amei", points: 4 },
    ],
  },
  {
    id: 26,
    text: "Alguém fala 'eu te amo':",
    answers: [
      { text: "😬 'Valeu'", points: 0 },
      { text: "👍 'Eu também'", points: 1 },
      { text: "😊 'Eu te amo também'", points: 2 },
      { text: "💕 'Amo você demais'", points: 3 },
      { text: "💋 'Você é tudo pra mim'", points: 4 },
    ],
  },
  {
    id: 27,
    text: "Filme de terror:",
    answers: [
      { text: "😴 Durmo no meio", points: 0 },
      { text: "😐 Assisto normal", points: 1 },
      { text: "😰 Fico tenso", points: 2 },
      { text: "😱 Grito nas partes de susto", points: 3 },
      { text: "🙈 Fecho os olhos o tempo todo", points: 4 },
    ],
  },
  {
    id: 28,
    text: "Como você cumprimenta amigos:",
    answers: [
      { text: "🤝 Aperto de mão", points: 0 },
      { text: "👊 Soco no ombro", points: 1 },
      { text: "🤗 Abraço", points: 2 },
      { text: "💋 Beijinho no rosto", points: 3 },
      { text: "💕 Abraço apertado e grito", points: 4 },
    ],
  },
  {
    id: 29,
    text: "Animal de estimação ideal:",
    answers: [
      { text: "🐕 Pitbull", points: 0 },
      { text: "🐶 Cachorro grande", points: 1 },
      { text: "🐱 Gato", points: 2 },
      { text: "🐩 Poodle", points: 3 },
      { text: "🐾 Chihuahua de lacinho", points: 4 },
    ],
  },
  {
    id: 30,
    text: "Casal gay se beijando:",
    answers: [
      { text: "😒 Viro a cara", points: 0 },
      { text: "😐 Tanto faz", points: 1 },
      { text: "😊 Acho normal", points: 2 },
      { text: "💕 Acho lindo", points: 3 },
      { text: "📸 Tiro foto pra postar", points: 4 },
    ],
  },

  // 31-40: Estilo e Aparência
  {
    id: 31,
    text: "Como você escolhe roupa:",
    answers: [
      { text: "👕 Pego a primeira que vejo", points: 0 },
      { text: "👔 Qualquer uma limpa", points: 1 },
      { text: "👗 Penso um pouco", points: 2 },
      { text: "💄 Combino cores e estilo", points: 3 },
      { text: "✨ Monto look completo", points: 4 },
    ],
  },
  {
    id: 32,
    text: "Seu perfume:",
    answers: [
      { text: "🚫 Não uso", points: 0 },
      { text: "🧴 Desodorante resolve", points: 1 },
      { text: "💨 Uso perfume básico", points: 2 },
      { text: "✨ Tenho perfume bom", points: 3 },
      { text: "💎 Coleção de perfumes importados", points: 4 },
    ],
  },
  {
    id: 33,
    text: "Cuidado com as unhas:",
    answers: [
      { text: "🔪 Corto com dente", points: 0 },
      { text: "✂️ Corto quando lembro", points: 1 },
      { text: "💅 Corto regularmente", points: 2 },
      { text: "✨ Faço as unhas", points: 3 },
      { text: "💎 Manicure toda semana", points: 4 },
    ],
  },
  {
    id: 34,
    text: "Seu cabelo:",
    answers: [
      { text: "✂️ Corto em casa", points: 0 },
      { text: "💈 Barbeiro básico", points: 1 },
      { text: "💇 Salão normal", points: 2 },
      { text: "✨ Salão bom", points: 3 },
      { text: "💎 Cabeleireiro famoso", points: 4 },
    ],
  },
  {
    id: 35,
    text: "Acessórios:",
    answers: [
      { text: "⌚ Só relógio", points: 0 },
      { text: "👔 Relógio e cinto", points: 1 },
      { text: "💍 Alguns acessórios", points: 2 },
      { text: "✨ Vários acessórios", points: 3 },
      { text: "💎 Cheio de acessórios", points: 4 },
    ],
  },
  {
    id: 36,
    text: "Roupa pra dormir:",
    answers: [
      { text: "🩲 Cueca", points: 0 },
      { text: "👕 Camiseta velha", points: 1 },
      { text: "🛌 Pijama normal", points: 2 },
      { text: "✨ Pijama bonito", points: 3 },
      { text: "💎 Robe de seda", points: 4 },
    ],
  },
  {
    id: 37,
    text: "Tatuagem:",
    answers: [
      { text: "💪 Tribal/caveira", points: 0 },
      { text: "🦅 Águia/leão", points: 1 },
      { text: "🌹 Algo significativo", points: 2 },
      { text: "✨ Algo delicado", points: 3 },
      { text: "🦋 Borboleta/flor", points: 4 },
    ],
  },
  {
    id: 38,
    text: "Seu estilo de roupa:",
    answers: [
      { text: "👕 Camiseta e bermuda", points: 0 },
      { text: "👔 Casual masculino", points: 1 },
      { text: "👗 Moderno", points: 2 },
      { text: "✨ Fashion", points: 3 },
      { text: "💎 Extravagante", points: 4 },
    ],
  },
  {
    id: 39,
    text: "Maquiagem:",
    answers: [
      { text: "❌ Jamais", points: 0 },
      { text: "🚫 Não é pra mim", points: 1 },
      { text: "🤔 Talvez em festa", points: 2 },
      { text: "✨ Uso às vezes", points: 3 },
      { text: "💄 Uso sempre", points: 4 },
    ],
  },
  {
    id: 40,
    text: "Sua bolsa/mochila:",
    answers: [
      { text: "🎒 Mochila preta", points: 0 },
      { text: "💼 Mochila/mala normal", points: 1 },
      { text: "👜 Bolsa discreta", points: 2 },
      { text: "✨ Bolsa estilosa", points: 3 },
      { text: "💎 Bolsa de grife", points: 4 },
    ],
  },

  // 41-50: Situações Específicas e Atração
  {
    id: 41,
    text: "Negão na praia de nudismo:",
    answers: [
      { text: "🙈 Furo meus olhos", points: 0 },
      { text: "😐 Olho discretamente", points: 1 },
      { text: "👀 Dou uma olhadinha", points: 2 },
      { text: "😍 Olho bastante", points: 3 },
      { text: "📸 Peço o Instagram", points: 4 },
    ],
  },
  {
    id: 42,
    text: "Channing Tatum sem camisa:",
    answers: [
      { text: "💪 'Preciso malhar'", points: 0 },
      { text: "😶 'O cara é bonito'", points: 1 },
      { text: "😳 Olho mais tempo que deveria", points: 2 },
      { text: "🤤 Salvo a foto", points: 3 },
      { text: "😍 Viro fã", points: 4 },
    ],
  },
  {
    id: 43,
    text: "Vestiário da academia:",
    answers: [
      { text: "🏃 Troco olhando pra parede", points: 0 },
      { text: "😐 Troco normal", points: 1 },
      { text: "👁️ Dou uma conferida discreta", points: 2 },
      { text: "👀 Olho bastante", points: 3 },
      { text: "🎭 Faço desfile", points: 4 },
    ],
  },
  {
    id: 44,
    text: "Amigo te chama de 'gato':",
    answers: [
      { text: "😠 Fico bravo", points: 0 },
      { text: "😐 Ignoro", points: 1 },
      { text: "😊 Agradeço", points: 2 },
      { text: "💁 'Eu sei'", points: 3 },
      { text: "💋 'Você também'", points: 4 },
    ],
  },
  {
    id: 45,
    text: "Música na balada:",
    answers: [
      { text: "🎸 Rock/sertanejo", points: 0 },
      { text: "🎵 Qualquer uma", points: 1 },
      { text: "💃 Pop", points: 2 },
      { text: "✨ Diva pop", points: 3 },
      { text: "🌈 Gloria Gaynor", points: 4 },
    ],
  },
  {
    id: 46,
    text: "Roupa de academia:",
    answers: [
      { text: "👕 Camiseta velha", points: 0 },
      { text: "👔 Roupa normal", points: 1 },
      { text: "💪 Roupa de treino", points: 2 },
      { text: "✨ Conjunto estiloso", points: 3 },
      { text: "💎 Look completo de marca", points: 4 },
    ],
  },
  {
    id: 47,
    text: "Seu ídolo:",
    answers: [
      { text: "⚽ Cristiano Ronaldo", points: 0 },
      { text: "🎬 Ator de ação", points: 1 },
      { text: "🎤 Cantor pop", points: 2 },
      { text: "👑 Diva pop", points: 3 },
      { text: "✨ RuPaul", points: 4 },
    ],
  },
  {
    id: 48,
    text: "Seu drink no bar:",
    answers: [
      { text: "🍺 Cerveja", points: 0 },
      { text: "🥃 Whisky", points: 1 },
      { text: "🍹 Caipirinha", points: 2 },
      { text: "🍸 Drink elaborado", points: 3 },
      { text: "🌈 Drink rosa com glitter", points: 4 },
    ],
  },
  {
    id: 49,
    text: "Morango do Nordeste:",
    answers: [
      { text: "🤢 Prefiro rock", points: 0 },
      { text: "🤷 Não conheço", points: 1 },
      { text: "🎵 É pegajoso", points: 2 },
      { text: "💃 Gosto sim", points: 3 },
      { text: "🔥 Amo demais", points: 4 },
    ],
  },
  {
    id: 50,
    text: "Final do quiz:",
    answers: [
      { text: "👍 Legal", points: 0 },
      { text: "😊 Gostei", points: 1 },
      { text: "💕 Adorei", points: 2 },
      { text: "✨ Amei demais", points: 3 },
      { text: "🌈 Lacrou", points: 4 },
    ],
  },
];

const RESULTS: Result[] = [
  { percentage: 0, title: "Homão da Poha", description: "Você é tão macho que até o Chuck Norris pede dicas! Testosterona pura correndo nas veias. Respeito máximo, guerreiro!", emoji: "💪", badge: "Machão Raiz" },
  { percentage: 3, title: "Macho Alfa (SQN)", description: "Você é o líder do grupo, o que paga de durão. Mas a gente sabe que você usa o shampoo da sua namorada escondido.", emoji: "🦁", badge: "Hétero Top" },
  { percentage: 6, title: "Hétero Top Curioso", description: "Você não é curioso sobre o Vale, você é curioso sobre 'qual o melhor whey protein'. Sua praia é a academia, não a boate.", emoji: "😎", badge: "Hétero Confirmado" },
  { percentage: 9, title: "Galã Raiz", description: "Você é o capitão do time de futebol e o galã da turma. Seu repertório de cantada pode ser de 2009, mas funciona!", emoji: "🏋️", badge: "Galã" },
  { percentage: 12, title: "\"Não sou gay, mas...\"", description: "Você completa essa frase com '...meu carro é automático'. Sua maior preocupação é se o IPVA tá pago. Continue assim, campeão.", emoji: "👀", badge: "Questionador" },
  { percentage: 15, title: "Brother Aliado", description: "Você é o brother que dá conselho amoroso e respeita todo mundo. Um aliado de verdade, sem preconceito!", emoji: "🤝", badge: "Aliado" },
  { percentage: 18, title: "Sensível Moderno", description: "Você é daqueles caras que não tem medo de mostrar sentimentos. Masculinidade moderna, sem neuras!", emoji: "🎯", badge: "Moderno" },
  { percentage: 21, title: "Estiloso Descolado", description: "Você se veste bem, curte música boa e não liga pro que os outros pensam. Estilo próprio!", emoji: "🕶️", badge: "Estiloso" },
  { percentage: 24, title: "Metrossexual Raiz", description: "Você cuida da aparência, faz um carão no espelho e manda bem nas fotos. O Instagram agradece!", emoji: "💇", badge: "Vaidoso" },
  { percentage: 27, title: "Dançarino nas Horas Vagas", description: "Se tocar um funk na festa, você manda ver. Dançar bem é coisa de quem tem ritmo, não tem nada a ver!", emoji: "🎵", badge: "Dançarino" },
  { percentage: 30, title: "Filósofo de Boteco", description: "Você é cheio de sabedoria e sempre tem uma frase de efeito na ponta da língua. O mestre dos conselhos!", emoji: "🍺", badge: "Filósofo" },
  { percentage: 33, title: "Conselheiro do Rolê", description: "Você não dá opinião, você dá sentença. Seus conselhos são lei no grupo!", emoji: "🎱", badge: "Conselheiro" },
  { percentage: 36, title: "Zen Master", description: "Você navega entre os mundos com a tranquilidade de quem já viu de tudo. Paz, amor e um bom drink.", emoji: "🧘", badge: "Zen" },
  { percentage: 39, title: "Influencer Raiz", description: "Você já inspira a galera mais nova. É tipo uma celebridade local, todo mundo te conhece na quebrada.", emoji: "📱", badge: "Influencer" },
  { percentage: 42, title: "Daniela Mercury", description: "O canto da cidade é você! Onde você chega, o carnaval começa. Pura energia e axé.", emoji: "⚖️", badge: "Equilibrada" },
  { percentage: 45, title: "Ney Matogrosso", description: "Andrógino, transgressor e com uma presença de palco inconfundível. Você não segue regras, você as cria.", emoji: "🌈", badge: "Livre" },
  { percentage: 48, title: "Glória Groove", description: "Uma metamorfose ambulante. Você tem múltiplas facetas e domina todas elas com perfeição. Lady Leste!", emoji: "🎵", badge: "Autêntica" },
  { percentage: 51, title: "Dono(a) do Open Bar", description: "Sua missão é clara: não deixar copo vazio e garantir que a festa só termine quando o sol raiar. Um herói.", emoji: "🎹", badge: "Brilhante" },
  { percentage: 54, title: "Linn da Quebrada", description: "Você é arte, ativismo e afronta. Sua existência é um ato político e poético. Trava na beleza!", emoji: "🦚", badge: "Único" },
  { percentage: 57, title: "Profissional do Bate-Cabelo", description: "Cuidado com o pescoço! Seu bate-cabelo já pode ser registrado como uma arma de destruição em massa.", emoji: "💃", badge: "Quase Lá" },
  { percentage: 60, title: "Lacre com Firma Reconhecida", description: "Seu lacre não é amador, é oficial. Já tem CNPJ, emite nota fiscal e tem filial em Paris.", emoji: "👑", badge: "Soltando" },
  { percentage: 63, title: "Robocop Gay", description: "Forte, determinado e orgulhoso! Você é gay e não tem medo de nada. Respeita!", emoji: "🤖", badge: "Robocop" },
  { percentage: 66, title: "Perigo Ambulante", description: "Você não anda, você desfila. Sua simples presença já causa suspiros, inveja e alguns torcicolos.", emoji: "💗", badge: "Empreendedor" },
  { percentage: 69, title: "Pabllo Vittar", description: "K.O.! Você chegou no nível de uma das maiores do mundo. Problema seu se o hétero não gostou.", emoji: "😏", badge: "Ativista" },
  { percentage: 72, title: "CEO do Lacre", description: "Você não participa de discussões, você preside a reunião. Sua opinião é o memorando final.", emoji: "✨", badge: "Confirmado" },
  { percentage: 75, title: "Doutorado em Shade", description: "Sua língua é mais afiada que bisturi. Você não ofende, você faz um diagnóstico preciso da falta de noção alheia.", emoji: "👠", badge: "Fabulosa" },
  { percentage: 78, title: "Monumento do Vale", description: "Você não é mais uma pessoa, é um ponto turístico. As gays mais novas fazem peregrinação pra te ver.", emoji: "💅", badge: "Diva" },
  { percentage: 81, title: "Patrimônio Queer", description: "Sua história, seus looks e seus deboches deveriam ser estudados em universidades. Você é cultura!", emoji: "🎭", badge: "Excêntrica" },
  { percentage: 84, title: "Apoteose do Deboche", description: "Seu deboche atingiu níveis cósmicos. Você poderia encerrar uma guerra apenas levantando uma sobrancelha.", emoji: "😈", badge: "Lacrador" },
  { percentage: 87, title: "Entidade Cósmica", description: "Você não vive, você paira. Sua energia é sentida em outras dimensões. As estrelas pedem seu autógrafo.", emoji: "👸", badge: "Lendária" },
  { percentage: 90, title: "RuPaul (Versão BR)", description: "Shantay, you stay! Você é a jurada, a apresentadora e a inspiração. Pode ligar as suas câmeras!", emoji: "🦄", badge: "Imortal" },
  { percentage: 93, title: "Beyoncé de Taubaté", description: "Você tem a atitude da Beyoncé, mesmo que o orçamento seja de Taubaté. E quer saber? Você entrega tudo!", emoji: "🎩", badge: "Supremo" },
  { percentage: 96, title: "Ameaça Global", description: "Seu beijo tem sabor de fruta mordida. Você é um clássico, um perigo irresistível que todos querem correr.", emoji: "🎤", badge: "Freddie" },
  { percentage: 100, title: "Viado Divino Transcendental", description: "Você atingiu o nível máximo! Você não é apenas gay, você É a essência gay do universo. Os anjos se curvam perante você!", emoji: "😇", badge: "Divino" },
];

// Função para embaralhar array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Componente de confete melhorado
const CanvasConfetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        life: 1,
        color: ["#ff006e", "#8338ec", "#3a86ff", "#fb5607", "#ffbe0b"][
          Math.floor(Math.random() * 5)
        ],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (particles.some((p) => p.life > 0)) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
    />
  );
};

// Componente de emojis animados
const AnimatedEmoji = ({ emoji }: { emoji: string }) => {
  return (
    <span className="inline-block animate-bounce" style={{
      animation: "bounce 0.6s infinite, pulse 0.8s infinite"
    }}>
      {emoji}
    </span>
  );
};

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [superGayMode, setSuperGayMode] = useState(false);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [startTime, setStartTime] = useState<number>(0); // NOVO: Rastrear tempo de início

  // Easter Eggs
  const easterEggs = useEasterEggs();

  const handleSecretName = (message: string) => {
    easterEggs.showSecretMessage(message, 5000);
  };

  const handleSpecialScore = (score: number) => {
    if (score === 0) {
      easterEggs.activateBlackScreen();
    } else if (score === 69) {
      easterEggs.showSecretMessage("😏 Nice! Pontuação especial detectada!", 5000);
      setShowConfetti(true);
    } else if (score === 60) {
      easterEggs.showSecretMessage("🏆 PERFEITO! Você é um mestre do quiz!", 5000);
      setShowConfetti(true);
    }
  };

  const handleLeaderboardEnd = () => {
    easterEggs.showSecretMessage("🌈 Você chegou ao fim do arco-íris! ✨", 5000);
  };

  // AudioContext global reutilizável (corrige problema mobile de limite de contextos)
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context se estiver suspenso (necessário para mobile)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Função auxiliar para obter o resultado baseado na porcentagem
  const getResultByPercentage = (percentage: number): Result => {
    let result = RESULTS[0];
    for (let i = RESULTS.length - 1; i >= 0; i--) {
      if (percentage >= RESULTS[i].percentage) {
        result = RESULTS[i];
        break;
      }
    }
    return result;
  };

  // EASTER EGG: Modo Super Gay
  useEffect(() => {
    let typed = "";
    
    const handleKeyPress = (e: KeyboardEvent) => {
      typed = (typed + e.key).slice(-3);
      
      if (typed.toLowerCase() === "gay") {
        setSuperGayMode(!superGayMode);
        
        if (!superGayMode) {
          document.body.classList.add("super-gay-mode");
          alert("🌈 MODO SUPER GAY ATIVADO! 🌈\n\nDigite 'gay' novamente para desativar.");
        } else {
          document.body.classList.remove("super-gay-mode");
        }
        
        typed = "";
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [superGayMode]);

  // Função para carregar o placar do banco de dados
  const loadLeaderboard = async () => {
    const placar = await buscarPlacar(50); // Top 50
    
    // Converter formato do banco para formato do frontend
    const entries: LeaderEntry[] = placar.map(score => {
      // Usar 15 como total de perguntas padrão para cálculo de porcentagem, 
      // pois o número real de perguntas pode variar
      const percentage = pontuacaoParaPercentual(score.pontuacao, 15); 
      return {
        name: score.apelido,
        percentage,
        result: getResultByPercentage(percentage).title,
        date: new Date(score.data_registro).toLocaleDateString("pt-BR"),
        tempo_segundos: score.tempo_segundos,
      };
    });
    
    setLeaderboard(entries);
  };

  // Carregar leaderboard ao montar o componente
  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Embaralhar perguntas ao iniciar
  useEffect(() => {
    if (quizStarted && questions.length === 0) {
      const shuffled = shuffleArray(QUESTIONS_POOL).slice(0, 15);
      // Embaralhar as respostas de cada pergunta
      const questionsWithShuffledAnswers = shuffled.map(q => ({
        ...q,
        answers: shuffleArray(q.answers)
      }));
      setQuestions(questionsWithShuffledAnswers);
      play8BitMusic();
    }
  }, [quizStarted, questions.length]);

  // Função para gerar um som de clique/resposta 8-bit
  const playSound = () => {
    if (!audioEnabled) return;
    const audioContext = getAudioContext(); // Usar contexto reutilizável
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000; // Frequência mais alta
    oscillator.type = "square"; // Onda quadrada para som 8-bit

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05); // Mais curto e rápido

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  // Função para gerar um som de sucesso (fim do quiz)
  const playSuccessSound = () => {
    if (!audioEnabled) return;
    const audioContext = getAudioContext(); // Usar contexto reutilizável
    const now = audioContext.currentTime;
    const noteLength = 0.1;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6 (Acorde de C maior)

    notes.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.value = freq;
      osc.type = "square";

      gain.gain.setValueAtTime(0.2, now + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + noteLength);

      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + noteLength);
    });
  };

  // Gerador de música 8-bits (toca ao iniciar quiz)
  const play8BitMusic = () => {
    if (!audioEnabled) return;
    const audioContext = getAudioContext(); // Usar contexto reutilizável
    const notes = [262, 294, 330, 349, 392, 440, 494, 523];

    const playNote = (freq: number, duration: number, time: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.value = freq;
      osc.type = "square";

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

      osc.start(time);
      osc.stop(time + duration);
    };

    const now = audioContext.currentTime;
    const noteLength = 0.1;

    const melody = [
      notes[0], notes[2], notes[4], notes[5],
      notes[4], notes[5], notes[7], notes[5],
      notes[4], notes[2], notes[0], notes[2],
    ];

    melody.forEach((note, index) => {
      playNote(note, noteLength, now + index * noteLength);
    });
  };

  const handleAnswer = (points: number) => {
    playSound();
    setFadeOut(true);

    setTimeout(() => {
      const newTotal = totalPoints + points;
      setTotalPoints(newTotal);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setFadeOut(false);
      } else {
        playSuccessSound(); // NOVO: Toca som de sucesso
        setShowConfetti(true);
        setShowNameInput(true);
      }
    }, 300);
  };

  const startQuiz = async () => {
    try {
      // Solicitar token de sessão ao backend
      const response = await fetch('/api/quiz/start');
      const data = await response.json();
      
      if (data.success && data.token) {
        // Armazenar token no sessionStorage
        sessionStorage.setItem('quiz_token', data.token);
        setQuizStarted(true);
        setStartTime(Date.now());
      } else {
        alert('Erro ao iniciar quiz. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao obter token:', error);
      alert('Erro ao conectar com o servidor. Tente novamente.');
    }
  };

  const getResult = (): Result => {
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    let result = RESULTS[0];
    for (let i = RESULTS.length - 1; i >= 0; i--) {
      if (percentage >= RESULTS[i].percentage) {
        result = RESULTS[i];
        break;
      }
    }
    return result;
  };

  const saveToLeaderboard = async (name: string) => {
    const tempoSegundos = (Date.now() - startTime) / 1000; // Calcula tempo em segundos
    const apelido = name || "Anônimo";

    // Salvar no banco de dados PostgreSQL
    const saved = await salvarPontuacao(apelido, totalPoints, tempoSegundos);

    if (saved) {
      console.log("✅ Pontuação salva no banco de dados:", saved);
      
      // Atualizar placar local
      await loadLeaderboard();
    } else {
      console.error("❌ Erro ao salvar pontuação");
      // Fallback: manter lógica antiga de localStorage (opcional, mas bom para robustez)
      const result = getResult();
      const maxPoints = questions.length * 4;
      const percentage = Math.round((totalPoints / maxPoints) * 100);
      
      const entry: LeaderEntry = {
        name: apelido,
        percentage,
        result: result.title,
        date: new Date().toLocaleDateString("pt-BR"),
      };
      
      const updated = [entry, ...leaderboard].slice(0, 50);
      setLeaderboard(updated);
      localStorage.setItem("gayQuizLeaderboard", JSON.stringify(updated));
    }

    setShowNameInput(false);
    setShowResult(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setTotalPoints(0);
    setShowResult(false);
    setQuizStarted(false);
    setQuestions([]);
    setShowConfetti(false);
    setFadeOut(false);
    setPlayerName("");
    setShowNameInput(false);
  };

  const shareResult = (platform: string) => {
    const result = getResult();
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    const text = `Fiz o teste "Descubra se você é gay" e meu resultado foi: ${result.title} (${percentage}%)! 🌈 Quer tentar também?`;
    const url = window.location.href;

    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
  };

  if (showLeaderboard) {
    return (
      <>
      <TopMenu />
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-2xl p-8 bg-white dark:bg-gray-800 shadow-2xl max-h-96 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            🏆 Placar de Líderes 🏆
          </h1>
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Nenhum resultado ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                  <div>
	                    <p className="font-bold text-gray-800 dark:text-white">#{index + 1} {entry.name}</p>
	                    <p className="text-sm text-gray-600 dark:text-gray-300">{entry.result} ({entry.percentage}%)</p>
	                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.date} {entry.tempo_segundos ? `(${entry.tempo_segundos.toFixed(2)}s)` : ""}</p>
                  </div>
                  <p className="text-2xl">{entry.percentage >= 85 ? "👑" : entry.percentage >= 65 ? "🌟" : "💜"}</p>
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={() => setShowLeaderboard(false)}
            className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2"
          >
            Voltar
          </Button>
        </Card>
      </div>
      <ChatWidget />
      <SuggestionButton />
      <LeaderboardEasterEgg onReachEnd={handleLeaderboardEnd} />
      </>
    );
  }

  if (showNameInput && !showResult) {
    return (
      <>
        <TopMenu />
        <ThemeToggle />
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md p-8 text-center bg-white dark:bg-gray-800 shadow-2xl">
          <div className="text-6xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Parabéns!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Quer aparecer no placar de líderes?</p>
          <input
            type="text"
            placeholder="Seu nome (ou deixe em branco para anônimo)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 border-2 border-purple-300 rounded-lg mb-4 focus:outline-none focus:border-purple-600"
            maxLength={20}
          />
          <Button
            onClick={() => saveToLeaderboard(playerName)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2"
          >
            Salvar no Placar 🏆
          </Button>
        </Card>
      </div>
      <ChatWidget />
      <SuggestionButton />
      <HomeEasterEggs
        playerName={playerName}
        totalPoints={totalPoints}
        onSecretName={handleSecretName}
        onSpecialScore={handleSpecialScore}
      />
      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <TopMenu />
        <ThemeToggle />
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center p-4 pt-20 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <Card className="w-full p-8 text-center bg-white dark:bg-gray-800 shadow-2xl mb-8">
            <div className="text-6xl mb-6">
              <AnimatedEmoji emoji="🌈" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Descubra se você é Gay!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Um teste 100% científico (não é) para descobrir seu nível de gayness! 
              Responda com honestidade e divirta-se! 😄
            </p>
	            <Button
	              onClick={startQuiz}
	              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 text-lg mb-3"
	            >
	              Começar Quiz! 🚀
	            </Button>

            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant="outline"
              className="w-full"
            >
              {audioEnabled ? "🔊 Som Ativado" : "🔇 Som Desativado"}
            </Button>
          </Card>

          {/* Placar de Líderes na tela inicial */}
          <Leaderboard leaderboard={leaderboard} maxItems={12} />
        </div>
      </div>
      <ChatWidget />
      <SuggestionButton />
      <LeaderboardEasterEgg onReachEnd={handleLeaderboardEnd} />
      <HomeEasterEggs
        playerName={playerName}
        totalPoints={totalPoints}
        onSecretName={handleSecretName}
        onSpecialScore={handleSpecialScore}
      />
      </>
    );
  }

  if (showResult && questions.length > 0) {
    const result = getResult();
    const maxPoints = questions.length * 4;
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    return (
      <>
        <TopMenu />
        <ThemeToggle />
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center p-4 pt-20 py-8 overflow-y-auto">
        {showConfetti && <CanvasConfetti />}
        
        <div className="w-full max-w-2xl">
          {/* Resultado Principal */}
          <div className="text-center mb-12">
            <div className="text-5xl mb-4 animate-bounce">{result.emoji}</div>
            <h1 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">
              {result.title}
            </h1>
            {result.badge && (
              <div className="mb-4 inline-block bg-white dark:bg-gray-700 px-5 py-2 rounded-full font-bold text-purple-600 dark:text-purple-300 shadow-lg text-sm">
                {result.badge}
              </div>
            )}
            <div className="mb-6">
              <div className="text-6xl font-bold text-white drop-shadow-lg mb-3">
                {percentage}%
              </div>
              <div className="w-full bg-white dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-lg">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <p className="text-white text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed drop-shadow-2xl max-w-3xl mx-auto px-4 py-6 whitespace-normal break-words bg-black/30 rounded-lg border-2 border-white/20">
              {result.description}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="max-w-md mx-auto mb-12 space-y-4">
            <Button
              onClick={resetQuiz}
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-purple-600 dark:text-purple-300 font-bold py-3 text-lg shadow-lg"
            >
              Tentar Novamente 🔄
            </Button>
          </div>

          {/* Placar de Líderes */}
          <Leaderboard leaderboard={leaderboard} maxItems={12} />

          {/* Botões de Compartilhamento */}
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-md mx-auto">
            <Button
              onClick={() => shareResult("twitter")}
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 text-lg shadow-lg"
            >
              𝕏
            </Button>
            <Button
              onClick={() => shareResult("whatsapp")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg shadow-lg"
            >
              WhatsApp
            </Button>
            <Button
              onClick={() => shareResult("facebook")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg shadow-lg"
            >
              Facebook
            </Button>
            <Button
              onClick={() => shareResult("telegram")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 text-lg shadow-lg"
            >
              Telegram
            </Button>
          </div>
        </div>
      </div>
      <ChatWidget />
      <SuggestionButton />
      <LeaderboardEasterEgg onReachEnd={handleLeaderboardEnd} />
      <HomeEasterEggs
        playerName={playerName}
        totalPoints={totalPoints}
        onSecretName={handleSecretName}
        onSpecialScore={handleSpecialScore}
      />
      </>
    );
  }

  if (questions.length === 0) {
    return (
    <>
      <WelcomeAnimation />
      <TopMenu />
      <ThemeToggle />
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex items-center justify-center p-4 pt-20">
        <CardSkeleton />
      </div>
      <ChatWidget />
      <SuggestionButton />
    </>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <TopMenu />
      <ThemeToggle />
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center justify-center p-4 pt-20">
        <Card
          className={`w-full max-w-2xl p-8 bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 ${
            fadeOut ? "opacity-50 scale-95" : "opacity-100 scale-100"
          }`}
        >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white text-center animate-in fade-in">
          <AnimatedEmoji emoji={["🤔", "💭", "❓"][currentQuestion % 3]} /> {question.text}
        </h2>

        {/* Answers */}
        <div className="space-y-4">
          {question.answers.map((answer, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(answer.points)}
              className="w-full p-6 h-auto text-left text-lg font-semibold bg-gradient-to-r from-pink-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 hover:from-pink-300 hover:to-purple-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-800 dark:text-white border-2 border-purple-300 dark:border-purple-500 hover:border-purple-500 transition-all duration-200 transform hover:scale-105 active:scale-95 whitespace-normal"
            >
              {answer.text}
            </Button>
          ))}
        </div>

        {/* Skip info */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
          Pergunta {currentQuestion + 1}/{questions.length}
        </p>
        </Card>
      </div>
      <ChatWidget />
      <SuggestionButton />
    </>
  );
}
