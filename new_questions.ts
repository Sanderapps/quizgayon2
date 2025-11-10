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
