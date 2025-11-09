import { useState, useEffect, useRef } from "react";
import { salvarPontuacao, buscarPlacar, pontuacaoParaPercentual } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    text: "Qual é a sua reação ao ver um homem bonito?",
    answers: [
      { text: "Meu coração acelerou!", points: 3 },
      { text: "Achei legal, mas nada de especial", points: 1 },
      { text: "Não notei nada", points: 0 },
    ],
  },
  {
    id: 2,
    text: "Como você se sente com a cor rosa?",
    answers: [
      { text: "É minha cor favorita! 💖", points: 3 },
      { text: "É uma cor bonita", points: 1 },
      { text: "Não gosto muito", points: 0 },
    ],
  },
  {
    id: 3,
    text: "Qual é sua reação ao ouvir 'Lady Gaga'?",
    answers: [
      { text: "RAINHA! *grita*", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 4,
    text: "Como você se veste normalmente?",
    answers: [
      { text: "Fashionista total! Tudo coordenado", points: 3 },
      { text: "Confortável e casual", points: 1 },
      { text: "Qualquer coisa que esteja limpa", points: 0 },
    ],
  },
  {
    id: 5,
    text: "Qual é sua reação ao ver um musical?",
    answers: [
      { text: "Já estou cantando junto!", points: 3 },
      { text: "Pode ser legal", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 6,
    text: "Como você se sente em uma festa?",
    answers: [
      { text: "Dançando no centro da pista!", points: 3 },
      { text: "Conversando com amigos", points: 1 },
      { text: "Prefiro ficar em casa", points: 0 },
    ],
  },
  {
    id: 7,
    text: "Qual é sua série favorita?",
    answers: [
      { text: "RuPaul's Drag Race ou similar", points: 3 },
      { text: "Qualquer série boa", points: 1 },
      { text: "Não assisto muito série", points: 0 },
    ],
  },
  {
    id: 8,
    text: "Como você reage a um comentário sobre sua aparência?",
    answers: [
      { text: "Fico feliz e quero mais elogios!", points: 3 },
      { text: "Fico um pouco envergonhado", points: 1 },
      { text: "Não me importo muito", points: 0 },
    ],
  },
  {
    id: 9,
    text: "Qual é sua reação ao ver um homem de biquíni na praia?",
    answers: [
      { text: "Não consigo desviar o olhar!", points: 3 },
      { text: "Acho normal", points: 1 },
      { text: "Não ligo", points: 0 },
    ],
  },
  {
    id: 10,
    text: "Como você se sente com piercings e tatuagens?",
    answers: [
      { text: "Adorei! Quero fazer mais!", points: 3 },
      { text: "Alguns ficam legais", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 11,
    text: "Qual é sua reação ao ver um casal do mesmo sexo se beijando?",
    answers: [
      { text: "Que fofo! ❤️", points: 3 },
      { text: "Normal, sem problemas", points: 1 },
      { text: "Fico desconfortável", points: 0 },
    ],
  },
  {
    id: 12,
    text: "Como você se sente com moda alternativa?",
    answers: [
      { text: "Adoro! Quero experimentar", points: 3 },
      { text: "Acho interessante", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 13,
    text: "Qual é sua reação ao ouvir 'Britney Spears'?",
    answers: [
      { text: "PRINCESA DO POP! 👑", points: 3 },
      { text: "Algumas músicas são boas", points: 1 },
      { text: "Não curto", points: 0 },
    ],
  },
  {
    id: 14,
    text: "Como você se sente em relação a skincare?",
    answers: [
      { text: "Tenho uma rotina completa!", points: 3 },
      { text: "Faço o básico", points: 1 },
      { text: "Não me importo muito", points: 0 },
    ],
  },
  {
    id: 15,
    text: "Qual é sua reação ao ver um homem com maquiagem?",
    answers: [
      { text: "Que legal! Quer dizer que ele é confiante!", points: 3 },
      { text: "Acho interessante", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 16,
    text: "Como você se sente com a comunidade LGBTQ+?",
    answers: [
      { text: "Sou parte dela! 🌈", points: 3 },
      { text: "Apoio totalmente", points: 1 },
      { text: "Não tenho opinião", points: 0 },
    ],
  },
  {
    id: 17,
    text: "Qual é sua reação ao ouvir 'Ariana Grande'?",
    answers: [
      { text: "Meu Deus, que voz! 😍", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 18,
    text: "Como você se sente com cabelo comprido em homens?",
    answers: [
      { text: "Adorei! Fica muito bonito!", points: 3 },
      { text: "Pode ficar legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 19,
    text: "Qual é sua reação ao ver um homem com unhas pintadas?",
    answers: [
      { text: "Que estilo! Quero fazer igual!", points: 3 },
      { text: "Acho interessante", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 20,
    text: "Como você se sente com a série 'Queer Eye'?",
    answers: [
      { text: "Adoro! Choro em todo episódio!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 21,
    text: "Qual é sua reação ao ouvir 'Madonna'?",
    answers: [
      { text: "RAINHA ABSOLUTA! 👑", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 22,
    text: "Como você se sente com sapatos de salto?",
    answers: [
      { text: "Adoro! Tenho vários!", points: 3 },
      { text: "Às vezes uso", points: 1 },
      { text: "Não uso", points: 0 },
    ],
  },
  {
    id: 23,
    text: "Qual é sua reação ao ver um homem com bolsa?",
    answers: [
      { text: "Que prático e estiloso!", points: 3 },
      { text: "Acho normal", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 24,
    text: "Como você se sente com a série 'Heartstopper'?",
    answers: [
      { text: "Que fofo! Amei demais!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 25,
    text: "Qual é sua reação ao ouvir 'Beyoncé'?",
    answers: [
      { text: "RAINHA! Sem discussão!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 26,
    text: "Como você se sente com a moda de celebridades gays?",
    answers: [
      { text: "Adoro! Muito inspirador!", points: 3 },
      { text: "Acho interessante", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
  {
    id: 27,
    text: "Qual é sua reação ao ver um homem com esmalte preto?",
    answers: [
      { text: "Que gótico e legal!", points: 3 },
      { text: "Acho interessante", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 28,
    text: "Como você se sente com a série 'Sex Education'?",
    answers: [
      { text: "Adorei! Muito bom!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 29,
    text: "Qual é sua reação ao ouvir 'Cher'?",
    answers: [
      { text: "LENDA! Sempre foi icônica!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 30,
    text: "Como você se sente com homens que usam brinco?",
    answers: [
      { text: "Muito sexy! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 31,
    text: "Qual é sua reação ao ver um homem com sobrancelha feita?",
    answers: [
      { text: "Que cuidado! Muito bonito!", points: 3 },
      { text: "Acho normal", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 32,
    text: "Como você se sente com a série 'The L Word'?",
    answers: [
      { text: "Clássico! Adorei!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 33,
    text: "Qual é sua reação ao ouvir 'Whitney Houston'?",
    answers: [
      { text: "DIVA SUPREMA! 👑", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 34,
    text: "Como você se sente com homens que usam corrente/colar?",
    answers: [
      { text: "Muito estiloso! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 35,
    text: "Qual é sua reação ao ver um homem com cabelo rosa/colorido?",
    answers: [
      { text: "Que coragem e estilo!", points: 3 },
      { text: "Acho interessante", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 36,
    text: "Como você se sente com a série 'Pose'?",
    answers: [
      { text: "Obra de arte! Amei!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 37,
    text: "Qual é sua reação ao ouvir 'Mariah Carey'?",
    answers: [
      { text: "RAINHA DO WHISTLE NOTE! 👑", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 38,
    text: "Como você se sente com homens que usam chapéu?",
    answers: [
      { text: "Muito estiloso! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 39,
    text: "Qual é sua reação ao ver um homem com barba bem feita?",
    answers: [
      { text: "Que sexy! Muito bonito!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
  {
    id: 40,
    text: "Como você se sente com a série 'Orange Is the New Black'?",
    answers: [
      { text: "Adorei! Muito bom!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 41,
    text: "Qual é sua reação ao ouvir 'Lady Gaga'?",
    answers: [
      { text: "RAINHA! *grita*", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 42,
    text: "Como você se sente com homens que usam óculos de grau?",
    answers: [
      { text: "Muito charmoso! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
  {
    id: 43,
    text: "Qual é sua reação ao ver um homem com piercing no nariz?",
    answers: [
      { text: "Que estiloso! Muito bonito!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 44,
    text: "Como você se sente com a série 'Sense8'?",
    answers: [
      { text: "Obra prima! Adorei!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 45,
    text: "Qual é sua reação ao ouvir 'Rihanna'?",
    answers: [
      { text: "RAINHA! Sem discussão!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 46,
    text: "Como você se sente com homens que usam pulseira?",
    answers: [
      { text: "Muito estiloso! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 47,
    text: "Qual é sua reação ao ver um homem com cabelo platinado?",
    answers: [
      { text: "Que estiloso! Muito bonito!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 48,
    text: "Como você se sente com a série 'Euphoria'?",
    answers: [
      { text: "Intenso e bom! Adorei!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 49,
    text: "Qual é sua reação ao ouvir 'Katy Perry'?",
    answers: [
      { text: "RAINHA DO POP! Incomparável!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 50,
    text: "Como você se sente com homens que usam cachecol?",
    answers: [
      { text: "Muito estiloso! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 51,
    text: "Qual é sua reação ao ver um homem com cabelo moicano?",
    answers: [
      { text: "Que estiloso! Muito bonito!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 52,
    text: "Como você se sente com a série 'Orange Is the New Black'?",
    answers: [
      { text: "Adorei! Muito bom!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 53,
    text: "Qual é sua reação ao ouvir 'Demi Lovato'?",
    answers: [
      { text: "DIVA! Incomparável!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 54,
    text: "Como você se sente com homens que usam relógio de marca?",
    answers: [
      { text: "Muito sofisticado! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
  {
    id: 55,
    text: "Qual é sua reação ao ver um homem com tatuagem grande?",
    answers: [
      { text: "Que sexy! Muito bonito!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 56,
    text: "Como você se sente com a série 'Heartstopper' Season 2?",
    answers: [
      { text: "Ainda mais fofo! Amei!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 57,
    text: "Qual é sua reação ao ouvir 'Freddie Mercury'?",
    answers: [
      { text: "LENDA ABSOLUTA! Incomparável!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 58,
    text: "Como você se sente com homens que usam óculos escuro?",
    answers: [
      { text: "Muito misterioso! Amo!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 59,
    text: "Qual é sua reação ao ver um homem com músculos definidos?",
    answers: [
      { text: "Que gato! Muito atraente!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
  {
    id: 60,
    text: "Como você se sente com a série 'Nós'?",
    answers: [
      { text: "Adorei! Muito bom!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 61,
    text: "Qual é sua reação ao ouvir 'David Bowie'?",
    answers: [
      { text: "ARTISTA REVOLUCIONÁRIO! Genial!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 62,
    text: "Como você se sente com homens que usam perfume sofisticado?",
    answers: [
      { text: "Que aroma! Muito atraente!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
  {
    id: 63,
    text: "Qual é sua reação ao ver um homem com sorriso bonito?",
    answers: [
      { text: "Que lindo! Derrete meu coração!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
  {
    id: 64,
    text: "Como você se sente com a série 'Sense8'?",
    answers: [
      { text: "Obra prima! Adorei!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 65,
    text: "Qual é sua reação ao ouvir 'Tina Turner'?",
    answers: [
      { text: "RAINHA DO ROCK! Incomparável!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 66,
    text: "Como você se sente com homens que usam maquiagem?",
    answers: [
      { text: "Que confiante! Muito bonito!", points: 3 },
      { text: "Acho interessante", points: 1 },
      { text: "Acho estranho", points: 0 },
    ],
  },
  {
    id: 67,
    text: "Qual é sua reação ao ver um homem com cabelo curly/cacheado?",
    answers: [
      { text: "Que lindo! Muito bonito!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não gosto", points: 0 },
    ],
  },
  {
    id: 68,
    text: "Como você se sente com a série 'Euphoria'?",
    answers: [
      { text: "Intenso e bom! Adorei!", points: 3 },
      { text: "É uma boa série", points: 1 },
      { text: "Não é meu tipo", points: 0 },
    ],
  },
  {
    id: 69,
    text: "Qual é sua reação ao ouvir 'Donna Summer'?",
    answers: [
      { text: "RAINHA DA DISCO! Incomparável!", points: 3 },
      { text: "Gosto de algumas músicas", points: 1 },
      { text: "Não é meu estilo", points: 0 },
    ],
  },
  {
    id: 70,
    text: "Como você se sente com homens que são confiantes e autênticos?",
    answers: [
      { text: "Que atraente! Muito sexy!", points: 3 },
      { text: "Acho legal", points: 1 },
      { text: "Não me importa", points: 0 },
    ],
  },
];

const RESULTS: Result[] = [
  {
    percentage: 0,
    title: "Hétero Confirmado ✅",
    description:
      "Você é tão hétero que até a bússola fica confusa! Mas hey, tudo bem ser você mesmo. Volte em 5 anos para fazer o teste novamente! 😄",
    emoji: "🎯",
    badge: "Hétero Puro",
  },
  {
    percentage: 5,
    title: "Hétero com Pitadas 🌈",
    description:
      "Você é principalmente hétero, mas tem aquele amigo que... você sabe. Nada de errado com isso! Você é um aliado de coração!",
    emoji: "🤝",
    badge: "Aliado",
  },
  {
    percentage: 15,
    title: "Hétero Questionador 🤔",
    description:
      "Algo está acontecendo aqui... Talvez você esteja apenas explorando seus sentimentos. E tudo bem! A vida é uma jornada.",
    emoji: "🛤️",
    badge: "Explorador",
  },
  {
    percentage: 25,
    title: "Bi-Curious 👀",
    description:
      "Você está claramente curioso! Talvez não seja 100% hétero, mas também não é 100% gay. Bem-vindo ao espectro!",
    emoji: "🌊",
    badge: "Curioso",
  },
  {
    percentage: 35,
    title: "Bi Confirmado 💜",
    description:
      "Você gosta de homens E mulheres? Parabéns! Você tem o dobro de opções de crush. Que privilégio! 😉",
    emoji: "💜",
    badge: "Bi Lindo",
  },
  {
    percentage: 45,
    title: "Bem no Meio 🎪",
    description:
      "Você é tão equilibrado que poderia ser acrobata! Homens e mulheres têm a mesma chance com você. Você é a definição de 50/50!",
    emoji: "⚖️",
    badge: "Equilibrado",
  },
  {
    percentage: 55,
    title: "Mais para Gay 🏳️‍🌈",
    description:
      "Você está claramente mais para o lado gay da força! Mas ainda tem espaço para apreciar a beleza de todos.",
    emoji: "🌟",
    badge: "Meio Gay",
  },
  {
    percentage: 65,
    title: "Gay Assumido 🏳️‍🌈",
    description:
      "Você é gay! E sabe o que? Isso é INCRÍVEL! Você sabe quem você é e não tem medo de mostrar. Rainha/Rei!",
    emoji: "👑",
    badge: "Gay Assumido",
  },
  {
    percentage: 75,
    title: "Super Gay 🔥",
    description:
      "Você é tão gay que até o arco-íris fica com inveja! Você é a personificação da comunidade LGBTQ+. Lendário!",
    emoji: "🔥",
    badge: "Super Gay",
  },
  {
    percentage: 85,
    title: "Mega Ultra Gay 🌈✨",
    description:
      "Você é tão gay que as outras letras da sigla LGBTQ+ estão com ciúmes! Você é uma lenda viva, um ícone, uma RAINHA/REI! O universo se inclina perante você! 👑✨",
    emoji: "✨",
    badge: "Rainha do Drama",
  },
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
      animation: "bounce 0.6s infinite, pulse 1s infinite"
    }}>
      {emoji}
    </span>
  );
};

// Gerador de música 8-bits
const play8BitMusic = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [nsfw, setNsfw] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [startTime, setStartTime] = useState<number>(0); // NOVO: Rastrear tempo de início

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
  }, [quizStarted, questions.length, nsfw]);

  const playSound = () => {
    if (!audioEnabled) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
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
        <Card className="w-full max-w-2xl p-8 bg-white shadow-2xl max-h-96 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            🏆 Placar de Líderes 🏆
          </h1>
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-600">Nenhum resultado ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                  <div>
	                    <p className="font-bold text-gray-800">#{index + 1} {entry.name}</p>
	                    <p className="text-sm text-gray-600">{entry.result} ({entry.percentage}%)</p>
	                    <p className="text-xs text-gray-500">{entry.date} {entry.tempo_segundos ? `(${entry.tempo_segundos.toFixed(2)}s)` : ""}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-2xl">
          <div className="text-6xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Parabéns!</h1>
          <p className="text-gray-600 mb-6">Quer aparecer no placar de líderes?</p>
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
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-2xl">
          <div className="text-6xl mb-6">
            <AnimatedEmoji emoji="🌈" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Descubra se você é Gay!
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            Um teste 100% científico (não é) para descobrir seu nível de gayness! 
            Responda com honestidade e divirta-se! 😄
          </p>
	          <Button
	            onClick={startQuiz} // NOVO: Chama a função startQuiz que registra o tempo
	            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 text-lg mb-3"
	          >
	            Começar Quiz! 🚀
	          </Button>
          <Button
            onClick={() => setNsfw(!nsfw)}
            variant="outline"
            className="w-full mb-3"
          >
            {nsfw ? "Modo Normal" : "Modo NSFW 🔞"}
          </Button>
          <Button
            onClick={() => setAudioEnabled(!audioEnabled)}
            variant="outline"
            className="w-full mb-3"
          >
            {audioEnabled ? "🔊 Som Ativado" : "🔇 Som Desativado"}
          </Button>
          <Button
            onClick={() => setShowLeaderboard(true)}
            variant="outline"
            className="w-full"
          >
            🏆 Ver Placar de Líderes
          </Button>
        </Card>
      </div>
    );
  }

  if (showResult && questions.length > 0) {
    const result = getResult();
    const maxPoints = questions.length * 3;
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex flex-col items-center justify-center p-4 py-12">
        {showConfetti && <CanvasConfetti />}
        
        <div className="w-full max-w-2xl">
          {/* Resultado Principal */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-6 animate-bounce">{result.emoji}</div>
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              {result.title}
            </h1>
            {result.badge && (
              <div className="mb-6 inline-block bg-white px-6 py-3 rounded-full font-bold text-purple-600 shadow-lg">
                {result.badge}
              </div>
            )}
            <div className="mb-8">
              <div className="text-7xl font-bold text-white drop-shadow-lg mb-4">
                {percentage}%
              </div>
              <div className="w-full bg-white rounded-full h-6 overflow-hidden shadow-lg">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <p className="text-white text-xl md:text-2xl leading-relaxed drop-shadow-lg max-w-xl mx-auto px-4 whitespace-normal break-words">
              {result.description}
            </p>
          </div>

          {/* Botões de Compartilhamento */}
          <div className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto">
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

          {/* Botões de Ação */}
          <div className="max-w-md mx-auto mb-12 space-y-4">
            <Button
              onClick={() => setShowLeaderboard(true)}
              className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 text-lg shadow-lg"
            >
              🏆 Ver Placar de Líderes
            </Button>
            <Button
              onClick={resetQuiz}
              className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 text-lg shadow-lg"
            >
              Tentar Novamente 🔄
            </Button>
          </div>

          {/* Placar de Líderes */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              🏆 Placar de Líderes 🏆
            </h2>
            {leaderboard.length === 0 ? (
              <p className="text-center text-gray-600 text-lg">Nenhum resultado ainda. Seja o primeiro!</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {leaderboard.slice(0, 20).map((entry, index) => (
	                  <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg hover:shadow-md transition-shadow">
	                    <div className="flex-1">
	                      <p className="font-bold text-gray-800 text-lg">#{index + 1} {entry.name}</p>
	                      <p className="text-sm text-gray-600">{entry.result}</p>
	                      <p className="text-xs text-gray-500">{entry.date} {entry.tempo_segundos ? `(${entry.tempo_segundos.toFixed(2)}s)` : ""}</p>
	                    </div>
                    <div className="text-right">
                      <p className="text-3xl">{entry.percentage >= 85 ? "👑" : entry.percentage >= 65 ? "🌟" : "💜"}</p>
                      <p className="font-bold text-purple-600 text-lg">{entry.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-2xl">
          <div className="text-4xl mb-6 animate-spin">⏳</div>
          <p className="text-gray-600 text-lg">Carregando perguntas...</p>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center p-4">
      <Card
        className={`w-full max-w-2xl p-8 bg-white shadow-2xl transition-all duration-300 ${
          fadeOut ? "opacity-50 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center animate-in fade-in">
          <AnimatedEmoji emoji={["🤔", "💭", "❓"][currentQuestion % 3]} /> {question.text}
        </h2>

        {/* Answers */}
        <div className="space-y-4">
          {question.answers.map((answer, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(answer.points)}
              className="w-full p-6 h-auto text-left text-lg font-semibold bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-300 hover:to-purple-300 text-gray-800 border-2 border-purple-300 hover:border-purple-500 transition-all duration-200 transform hover:scale-105 active:scale-95 whitespace-normal"
            >
              {answer.text}
            </Button>
          ))}
        </div>

        {/* Skip info */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Pergunta {currentQuestion + 1}/{questions.length}
        </p>
      </Card>
    </div>
  );
}
