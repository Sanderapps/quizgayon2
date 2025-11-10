import { useState, useEffect, useRef } from "react";
import { salvarPontuacao, buscarPlacar, pontuacaoParaPercentual } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RankBadge } from "@/components/RankBadge";
import { Leaderboard } from "@/components/Leaderboard";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  {
    id: 1,
    text: "Como você se sente vendo um negão na praia de nudismo?",
    answers: [
      { text: "🙈 Furo meus olhos pra não ver", points: 0 },
      { text: "😐 Olho discretamente e sigo em frente", points: 1 },
      { text: "👀 Dou uma olhadinha rápida", points: 2 },
      { text: "😍 Peço o Instagram dele", points: 3 },
    ],
  },
  {
    id: 2,
    text: "Sua reação ao ver Channing Tatum sem camisa?",
    answers: [
      { text: "💪 Penso: 'Preciso malhar mais'", points: 0 },
      { text: "😶 Reconheço que o cara é bonito", points: 1 },
      { text: "😳 Fico olhando mais tempo que deveria", points: 2 },
      { text: "🤤 Salvo a foto na pasta 'Inspiração'", points: 3 },
    ],
  },
  {
    id: 3,
    text: "O que você faz no vestiário da academia?",
    answers: [
      { text: "🏃 Troco rápido olhando pra parede", points: 0 },
      { text: "😐 Troco normal sem olhar pros lados", points: 1 },
      { text: "👁️ Dou uma conferida discreta", points: 2 },
      { text: "🎭 Faço um desfile", points: 3 },
    ],
  },
  {
    id: 4,
    text: "Qual sua opinião sobre Morango do Nordeste?",
    answers: [
      { text: "🤢 Prefiro rock", points: 0 },
      { text: "👍 É uma música ok", points: 1 },
      { text: "🎶 Canto junto no karaokê", points: 2 },
      { text: "💃 É meu hino!", points: 3 },
    ],
  },
  {
    id: 5,
    text: "Como você reage a um elogio de um amigo?",
    answers: [
      { text: "👊 'Valeu, mano'", points: 0 },
      { text: "😊 'Obrigado!'", points: 1 },
      { text: "🥰 'Ai, para!'", points: 2 },
      { text: "😘 'Eu sei, sou lindo!'", points: 3 },
    ],
  },
  {
    id: 6,
    text: "Qual sua bebida favorita?",
    answers: [
      { text: "🍺 Cerveja trincando", points: 0 },
      { text: "🍷 Vinho", points: 1 },
      { text: "🍹 Caipirinha de morango", points: 2 },
      { text: "🍸 Cosmopolitan", points: 3 },
    ],
  },
  {
    id: 7,
    text: "Como você dança em uma festa?",
    answers: [
      { text: "🧍 Fico parado no canto", points: 0 },
      { text: "🕺 Dou uns passinhos", points: 1 },
      { text: "💃 Danço até o chão", points: 2 },
      { text: "👑 Faço a coreografia de Single Ladies", points: 3 },
    ],
  },
  {
    id: 8,
    text: "O que você acha de Pabllo Vittar?",
    answers: [
      { text: "🔇 Não conheço", points: 0 },
      { text: "👍 Gosto de algumas músicas", points: 1 },
      { text: "🎶 Sou fã", points: 2 },
      { text: "💖 É minha rainha!", points: 3 },
    ],
  },
  {
    id: 9,
    text: "Como você escolhe suas roupas?",
    answers: [
      { text: "👕 Pego a primeira que vejo", points: 0 },
      { text: "🤔 Penso um pouco na combinação", points: 1 },
      { text: "💅 Demoro horas pra escolher", points: 2 },
      { text: "🛍️ Compro roupa nova toda semana", points: 3 },
    ],
  },
  {
    id: 10,
    text: "Qual sua série favorita?",
    answers: [
      { text: "📺 Peaky Blinders", points: 0 },
      { text: "🎬 Friends", points: 1 },
      { text: "👠 Sex and the City", points: 2 },
      { text: "👑 RuPaul's Drag Race", points: 3 },
    ],
  },
  {
    id: 11,
    text: "O que você faz quando vê uma aranha?",
    answers: [
      { text: "🔥 Queimo a casa", points: 0 },
      { text: "👟 Mato com o chinelo", points: 1 },
      { text: "🗣️ Grito e chamo alguém", points: 2 },
      { text: "🕷️ Dou um nome pra ela", points: 3 },
    ],
  },
  {
    id: 12,
    text: "Como você reage a um filme de terror?",
    answers: [
      { text: "😴 Durmo no meio", points: 0 },
      { text: "🙈 Cubro os olhos nas partes de susto", points: 1 },
      { text: "😱 Grito o filme todo", points: 2 },
      { text: "😂 Rio dos sustos", points: 3 },
    ],
  },
  {
    id: 13,
    text: "Qual seu animal de estimação ideal?",
    answers: [
      { text: "🐕 Um pitbull", points: 0 },
      { text: "🐈 Um gato", points: 1 },
      { text: "🐩 Um poodle", points: 2 },
      { text: "🦄 Um unicórnio", points: 3 },
    ],
  },
  {
    id: 14,
    text: "O que você acha de futebol?",
    answers: [
      { text: "⚽ É minha vida!", points: 0 },
      { text: "👍 Assisto de vez em quando", points: 1 },
      { text: "😴 Acho chato", points: 2 },
      { text: "💅 Prefiro a Copa do Mundo das Drags", points: 3 },
    ],
  },
  {
    id: 15,
    text: "Como você cumprimenta seus amigos?",
    answers: [
      { text: "🤝 Aperto de mão", points: 0 },
      { text: "🤗 Abraço", points: 1 },
      { text: "😘 Beijo no rosto", points: 2 },
      { text: "💋 Selinho", points: 3 },
    ],
  },
  {
    id: 16,
    text: "Qual sua opinião sobre astrologia?",
    answers: [
      { text: "🔭 Bobagem", points: 0 },
      { text: "🤔 Leio por curiosidade", points: 1 },
      { text: "♐ Sei meu mapa astral de cor", points: 2 },
      { text: "🔮 Faço o mapa de todo mundo", points: 3 },
    ],
  },
  {
    id: 17,
    text: "O que você faz no seu tempo livre?",
    answers: [
      { text: "🏋️ Academia", points: 0 },
      { text: "🎬 Netflix", points: 1 },
      { text: "🛍️ Shopping", points: 2 },
      { text: "💅 Spa day", points: 3 },
    ],
  },
  {
    id: 18,
    text: "Como você reage a uma fofoca?",
    answers: [
      { text: "👂 Não ligo", points: 0 },
      { text: "🤔 Ouço com atenção", points: 1 },
      { text: "🗣️ Peço mais detalhes", points: 2 },
      { text: "📝 Anoto tudo", points: 3 },
    ],
  },
  {
    id: 19,
    text: "Qual seu emoji mais usado?",
    answers: [
      { text: "👍", points: 0 },
      { text: "😂", points: 1 },
      { text: "🥰", points: 2 },
      { text: "💅", points: 3 },
    ],
  },
  {
    id: 20,
    text: "O que você acha de Anitta?",
    answers: [
      { text: "🔇 Não gosto", points: 0 },
      { text: "👍 Gosto de algumas músicas", points: 1 },
      { text: "🎶 Sou fã", points: 2 },
      { text: "💖 Minha inspiração!", points: 3 },
    ],
  },
  {
    id: 21,
    text: "Como você lida com um pneu furado?",
    answers: [
      { text: "🔧 Troco sozinho", points: 0 },
      { text: "📞 Ligo pro seguro", points: 1 },
      { text: "😭 Entro em pânico", points: 2 },
      { text: "📸 Faço um story", points: 3 },
    ],
  },
  {
    id: 22,
    text: "Qual sua cor favorita?",
    answers: [
      { text: "⚫ Preto", points: 0 },
      { text: "🔵 Azul", points: 1 },
      { text: "💖 Rosa", points: 2 },
      { text: "🌈 Todas!", points: 3 },
    ],
  },
  {
    id: 23,
    text: "O que você faz quando está triste?",
    answers: [
      { text: "🍺 Bebo uma cerveja", points: 0 },
      { text: "🍦 Como um pote de sorvete", points: 1 },
      { text: "😭 Choro ouvindo Adele", points: 2 },
      { text: "🛍️ Vou às compras", points: 3 },
    ],
  },
  {
    id: 24,
    text: "Qual sua opinião sobre BBB?",
    answers: [
      { text: "📺 Não assisto", points: 0 },
      { text: "👍 Acompanho de vez em quando", points: 1 },
      { text: "🗣️ Comento tudo no Twitter", points: 2 },
      { text: "📝 Faço bolão e mutirão", points: 3 },
    ],
  },
  {
    id: 25,
    text: "Como você reage a um 'eu te amo'?",
    answers: [
      { text: "😬 'Valeu'", points: 0 },
      { text: "😊 'Eu também'", points: 1 },
      { text: "🥰 'Own, que fofo!'", points: 2 },
      { text: "💍 'Já podemos casar?'", points: 3 },
    ],
  },
  {
    id: 26,
    text: "Qual seu tipo de filme favorito?",
    answers: [
      { text: "💥 Ação", points: 0 },
      { text: "😂 Comédia", points: 1 },
      { text: "💖 Comédia romântica", points: 2 },
      { text: "🎶 Musical", points: 3 },
    ],
  },
  {
    id: 27,
    text: "O que você acha de Glória Groove?",
    answers: [
      { text: "🔇 Quem?", points: 0 },
      { text: "👍 Gosto de algumas músicas", points: 1 },
      { text: "🎶 Sou fã", points: 2 },
      { text: "💖 Ícone!", points: 3 },
    ],
  },
  {
    id: 28,
    text: "Como você tira uma selfie?",
    answers: [
      { text: "🤳 Rápido e sem pose", points: 0 },
      { text: "🤔 Procuro o melhor ângulo", points: 1 },
      { text: "💅 Faço carão", points: 2 },
      { text: "📸 Faço um ensaio completo", points: 3 },
    ],
  },
  {
    id: 29,
    text: "Qual sua reação ao ver um filhote de cachorro?",
    answers: [
      { text: "👍 Bonitinho", points: 0 },
      { text: "😊 Que fofo!", points: 1 },
      { text: "🥰 Quero apertar!", points: 2 },
      { text: "😭 Choro de emoção", points: 3 },
    ],
  },
  {
    id: 30,
    text: "O que você faz no Natal?",
    answers: [
      { text: "🍖 Churrasco", points: 0 },
      { text: "🎄 Ceia em família", points: 1 },
      { text: "🎁 Troca de presentes", points: 2 },
      { text: "🎅 Me visto de Mamãe Noel", points: 3 },
    ],
  },
  {
    id: 31,
    text: "Qual sua opinião sobre Lady Gaga?",
    answers: [
      { text: "🎤 Cantora ok", points: 0 },
      { text: "👍 Gosto de algumas músicas", points: 1 },
      { text: "🎶 Sou Little Monster", points: 2 },
      { text: "🙏 Minha religião!", points: 3 },
    ],
  },
  {
    id: 32,
    text: "Como você reage a uma barata?",
    answers: [
      { text: "🔥 Toco fogo", points: 0 },
      { text: "👟 Mato com o chinelo", points: 1 },
      { text: "😱 Subo na cadeira", points: 2 },
      { text: "🏃 Saio correndo e gritando", points: 3 },
    ],
  },
  {
    id: 33,
    text: "Qual seu drink no bar?",
    answers: [
      { text: "🥃 Whisky", points: 0 },
      { text: "🍺 Cerveja", points: 1 },
      { text: "🍹 Gin tônica", points: 2 },
      { text: "🍸 Dry Martini", points: 3 },
    ],
  },
  {
    id: 34,
    text: "O que você acha de Madonna?",
    answers: [
      { text: "👵 Velha", points: 0 },
      { text: "👍 Rainha do Pop", points: 1 },
      { text: "🎶 Ícone atemporal", points: 2 },
      { text: "👑 Deusa!", points: 3 },
    ],
  },
  {
    id: 35,
    text: "Como você se veste para ir à padaria?",
    answers: [
      { text: "👕 Qualquer roupa", points: 0 },
      { text: "🤔 Uma roupa ok", points: 1 },
      { text: "💅 Me arrumo um pouco", points: 2 },
      { text: "💃 Look completo", points: 3 },
    ],
  },
  {
    id: 36,
    text: "Qual sua reação ao ver um casal gay se beijando?",
    answers: [
      { text: "😒 Viro a cara", points: 0 },
      { text: "😐 Normal", points: 1 },
      { text: "😊 Acho fofo", points: 2 },
      { text: "😍 Tiro foto e posto", points: 3 },
    ],
  },
  {
    id: 37,
    text: "O que você faz quando alguém te fecha no trânsito?",
    answers: [
      { text: "🤬 Xingo até a 5ª geração", points: 0 },
      { text: "😠 Buzino", points: 1 },
      { text: "🙄 Reviro os olhos", points: 2 },
      { text: "🙏 Mando luz", points: 3 },
    ],
  },
  {
    id: 38,
    text: "Qual sua opinião sobre Beyoncé?",
    answers: [
      { text: "🎤 Boa cantora", points: 0 },
      { text: "👍 Gosto muito", points: 1 },
      { text: "🐝 Sou da Beyhive", points: 2 },
      { text: "🛐 Minha religião!", points: 3 },
    ],
  },
  {
    id: 39,
    text: "Como você reage a um presente que não gostou?",
    answers: [
      { text: "😒 Falo na cara", points: 0 },
      { text: "😊 Agradeço e guardo", points: 1 },
      { text: "😬 Finjo que amei", points: 2 },
      { text: "🎁 Troco na primeira oportunidade", points: 3 },
    ],
  },
  {
    id: 40,
    text: "Qual sua reação ao final deste quiz?",
    answers: [
      { text: "👍 Legal", points: 0 },
      { text: "😂 Engraçado", points: 1 },
      { text: "🥰 Amei!", points: 2 },
      { text: "💅 Já quero fazer de novo!", points: 3 },
    ],
  },
];

const RESULTS: Result[] = [
  { percentage: 0, title: "Homão da Porra", description: "Você é tão macho que até o Chuck Norris pede dicas! Testosterona pura correndo nas veias. Respeito máximo, guerreiro!", emoji: "💪", badge: "Machão Raiz" },
  { percentage: 3, title: "Machão Raiz", description: "Hétero clássico, sem frescura. Você é do tipo que não tem dúvidas sobre quem você é. Segue o jogo, campeão!", emoji: "🦁", badge: "Hétero Top" },
  { percentage: 6, title: "Hétero Padrão", description: "Você é hétero e tá tudo bem! Nada de errado em ser você mesmo. Continue sendo autêntico!", emoji: "😎", badge: "Hétero Confirmado" },
  { percentage: 9, title: "Hétero Nutella", description: "Hétero moderno, mente aberta. Você respeita todo mundo e não tem preconceito. Aliado de verdade!", emoji: "🍫", badge: "Aliado" },
  { percentage: 12, title: "Hétero Curioso", description: "Hmm... algo tá acontecendo aqui. Talvez você esteja começando a questionar algumas coisas. Explorar é natural!", emoji: "👀", badge: "Questionador" },
  { percentage: 15, title: "Bi-Curioso de Armário", description: "Você tem curiosidade, mas ainda não assumiu nem pra si mesmo. Tá tudo bem, cada um tem seu tempo!", emoji: "🚪", badge: "No Armário" },
  { percentage: 18, title: "Morango do Nordeste", description: "Doce por fora, mas com um toque especial por dentro! Você tem aquele charme único que ninguém explica.", emoji: "🍓", badge: "Moranguinho" },
  { percentage: 21, title: "Pabllo Vittar Feelings", description: "Você sente aquela vibe da Pabllo! Não se define totalmente, mas curte a liberdade de ser quem quiser.", emoji: "🎤", badge: "Pabllo Vibe" },
  { percentage: 24, title: "Luan Santana Vibe", description: "Romântico e sensível, você aprecia beleza em todas as formas. Seu coração é grande demais!", emoji: "🎸", badge: "Romântico" },
  { percentage: 27, title: "Anitta Mode", description: "Poderosa, confiante e sem medo de experimentar! Você é do tipo que manda ver sem se importar com julgamentos.", emoji: "🔥", badge: "Poderosa" },
  { percentage: 30, title: "Ludmilla Energy", description: "Energia pura! Você tem aquela pegada forte e autêntica. Nada te para!", emoji: "⚡", badge: "Autêntica" },
  { percentage: 33, title: "Glória Groove Style", description: "Estilo único e personalidade marcante! Você sabe quem é e não tem medo de mostrar.", emoji: "💅", badge: "Estilosa" },
  { percentage: 36, title: "Pocah Vibes", description: "Gostosa, confiante e sem neura! Você curte a vida e aprecia beleza em todos os gêneros.", emoji: "💖", badge: "Gostosa" },
  { percentage: 39, title: "Juliette Confusa", description: "Tá meio perdida ainda, mas com muito carisma! Você tá descobrindo quem é e tá tudo bem.", emoji: "🤷", badge: "Descobrindo" },
  { percentage: 42, title: "Preta Gil Equilibrado", description: "Equilíbrio perfeito! Você aprecia homens e mulheres igualmente. Sorte a sua ter tantas opções!", emoji: "⚖️", badge: "Equilibrada" },
  { percentage: 45, title: "Daniela Mercury", description: "Livre como o vento! Você não se prende a rótulos e curte a vida com intensidade.", emoji: "🌈", badge: "Livre" },
  { percentage: 48, title: "Cassia Eller", description: "Autêntica e sem frescura! Você é quem é, sem máscaras. Respeito total!", emoji: "🎵", badge: "Autêntica" },
  { percentage: 51, title: "Elton John Brasileiro", description: "Talento e personalidade! Você tem aquele brilho especial que ilumina qualquer ambiente.", emoji: "🎹", badge: "Brilhante" },
  { percentage: 54, title: "Ney Matogrosso", description: "Único, inconfundível! Você é uma obra de arte viva, impossível de categorizar.", emoji: "🦚", badge: "Único" },
  { percentage: 57, title: "Quase Inês Brasil", description: "Você tá quase lá! Falta pouco pra você assumir toda sua essência. Vai com tudo!", emoji: "💃", badge: "Quase Lá" },
  { percentage: 60, title: "Inês Brasil Iniciante", description: "Começando a soltar a franga! Você tá descobrindo seu lado mais livre e tá adorando.", emoji: "👑", badge: "Soltando" },
  { percentage: 63, title: "Robocop Gay", description: "Forte, determinado e orgulhoso! Você é gay e não tem medo de nada. Respeita!", emoji: "🤖", badge: "Robocop" },
  { percentage: 66, title: "Pablo Marçal Pink", description: "Empreendedor do amor! Você investe em todas as possibilidades, mas prefere o mesmo time.", emoji: "💗", badge: "Empreendedor" },
  { percentage: 69, title: "Jean Wyllys Nice", description: "Ativista do coração! Você é gay, assume e ainda luta pelos direitos de todo mundo. Lindo!", emoji: "😏", badge: "Ativista" },
  { percentage: 72, title: "Pabllo Vittar Confirmado", description: "Confirmadíssimo! Você é gay e arrasa por onde passa. Sua presença ilumina!", emoji: "✨", badge: "Confirmado" },
  { percentage: 75, title: "Drag Queen Raiz", description: "Fabulosa e sem medo! Você é pura arte, glamour e atitude. Rainha!", emoji: "👠", badge: "Fabulosa" },
  { percentage: 78, title: "Madonna Brasileira", description: "Ícone pop! Você é referência, trendsetter e arrasa em tudo que faz. Diva suprema!", emoji: "💅", badge: "Diva" },
  { percentage: 81, title: "Lady Gaga Tupiniquim", description: "Excêntrica e talentosa! Você não tem medo de ser diferente e isso te torna incrível.", emoji: "🎭", badge: "Excêntrica" },
  { percentage: 84, title: "Bicha Má Lacração", description: "Lacrou! Você é a bicha má que todo mundo respeita. Sua presença é marcante!", emoji: "😈", badge: "Lacrador" },
  { percentage: 87, title: "RuPaul Brazuca", description: "Lendária! Você é referência absoluta, um ícone vivo da comunidade. Reverência!", emoji: "👸", badge: "Lendária" },
  { percentage: 90, title: "Cher Tropical", description: "Eterna e fabulosa! Você transcende gerações e continua arrasando. Imortal!", emoji: "🦄", badge: "Imortal" },
  { percentage: 93, title: "Elton John Supremo", description: "Supremo em todos os sentidos! Você é a realeza gay, o topo da cadeia. Majestade!", emoji: "🎩", badge: "Supremo" },
  { percentage: 96, title: "Freddie Mercury Reencarnado", description: "Você é tão gay que deve ser a reencarnação do Freddie! Lendário, icônico, IMORTAL!", emoji: "🎤", badge: "Freddie" },
  { percentage: 99, title: "Viado Divino Transcendental", description: "Você atingiu o nível máximo! Você não é apenas gay, você É a essência gay do universo. Os anjos se curvam perante você!", emoji: "😇", badge: "Divino" },
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

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [startTime, setStartTime] = useState<number>(0); // NOVO: Rastrear tempo de início

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

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now()); // NOVO: Registra tempo de início
  };

  const getResult = (): Result => {
    const maxPoints = questions.length * 3;
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
      const maxPoints = questions.length * 3;
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
    const maxPoints = questions.length * 3;
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
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center p-4">
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
    );
  }

  if (showNameInput && !showResult) {
    return (
      <>
        <ThemeToggle />
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex items-center justify-center p-4">
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
      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <ThemeToggle />
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center p-4 py-8 overflow-y-auto">
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
      </>
    );
  }

  if (showResult && questions.length > 0) {
    const result = getResult();
    const maxPoints = questions.length * 3;
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    return (
      <>
        <ThemeToggle />
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center p-4 py-8 overflow-y-auto">
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
            <p className="text-white text-lg md:text-xl leading-relaxed drop-shadow-lg max-w-xl mx-auto px-4 whitespace-normal break-words">
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
      </>
    );
  }

  if (questions.length === 0) {
    return (
    <>
      <ThemeToggle />
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white dark:bg-gray-800 shadow-2xl">
          <div className="text-4xl mb-6 animate-spin">⏳</div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Carregando perguntas...</p>
        </Card>
      </div>
    </>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <ThemeToggle />
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex flex-col items-center justify-center p-4">
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
    </>
  );
}
