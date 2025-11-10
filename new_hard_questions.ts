// PERGUNTAS MAIS DIFÍCEIS - CULTURA LGBTQ+ ESPECÍFICA
// Substitui as perguntas genéricas por perguntas que exigem conhecimento real

const HARD_QUESTIONS = [
  // 1-10: História e Cultura LGBTQ+
  {
    id: 1,
    text: "O que foi a Revolta de Stonewall (1969)?",
    answers: [
      { text: "🤷 Não sei o que é isso", points: 0 },
      { text: "📰 Já ouvi falar vagamente", points: 1 },
      { text: "🏳️‍🌈 Protesto importante LGBT", points: 2 },
      { text: "✊ Marco da luta LGBT em NY", points: 3 },
      { text: "🔥 Revolta no bar Stonewall Inn que iniciou movimento LGBT moderno", points: 4 },
    ],
  },
  {
    id: 2,
    text: "Quem foi Marsha P. Johnson?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "🤔 Nome me soa familiar", points: 1 },
      { text: "🏳️‍⚧️ Ativista trans", points: 2 },
      { text: "✊ Pioneira em Stonewall", points: 3 },
      { text: "👑 Drag queen ativista negra trans, heroína de Stonewall", points: 4 },
    ],
  },
  {
    id: 3,
    text: "O que significa 'Pajubá'?",
    answers: [
      { text: "🤷 Nunca ouvi", points: 0 },
      { text: "🎭 Algo relacionado a drag", points: 1 },
      { text: "💬 Gíria gay", points: 2 },
      { text: "🗣️ Dialeto da comunidade LGBT", points: 3 },
      { text: "👑 Linguagem secreta criada por gays e travestis no Brasil", points: 4 },
    ],
  },
  {
    id: 4,
    text: "Qual o significado de 'Amapô' no Pajubá?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "🤔 Algo negativo?", points: 1 },
      { text: "👎 Algo ruim", points: 2 },
      { text: "😰 Perigo ou polícia", points: 3 },
      { text: "🚨 Polícia (usado para alertar sobre batidas policiais)", points: 4 },
    ],
  },
  {
    id: 5,
    text: "O que é 'Ballroom culture'?",
    answers: [
      { text: "💃 Dança de salão", points: 0 },
      { text: "🎭 Algo de drag queens", points: 1 },
      { text: "🏆 Competições LGBT", points: 2 },
      { text: "👗 Desfiles e voguing", points: 3 },
      { text: "✨ Cultura de bailes competitivos LGBT negros e latinos de NY", points: 4 },
    ],
  },
  {
    id: 6,
    text: "Qual filme cult LGBT brasileiro dos anos 80?",
    answers: [
      { text: "🎬 Não conheço filmes LGBT antigos", points: 0 },
      { text: "📽️ Carandiru?", points: 1 },
      { text: "🌟 Madame Satã", points: 2 },
      { text: "👗 Priscilla", points: 3 },
      { text: "💋 Vera Verão (documentário sobre travesti pioneira)", points: 4 },
    ],
  },
  {
    id: 7,
    text: "O que significa 'Bear' na comunidade gay?",
    answers: [
      { text: "🐻 Urso literal?", points: 0 },
      { text: "💪 Homem forte", points: 1 },
      { text: "🧔 Homem peludo", points: 2 },
      { text: "🐻 Homem grande, peludo e másculo", points: 3 },
      { text: "👨 Subcultura gay de homens grandes, peludos e masculinos", points: 4 },
    ],
  },
  {
    id: 8,
    text: "Quem é Divine?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "🎤 Cantora?", points: 1 },
      { text: "🎭 Drag queen famosa", points: 2 },
      { text: "🌟 Ícone drag dos anos 70/80", points: 3 },
      { text: "👑 Drag queen lendária de John Waters, ícone underground", points: 4 },
    ],
  },
  {
    id: 9,
    text: "O que foi o 'Lavender Scare' nos EUA?",
    answers: [
      { text: "🤷 Não sei", points: 0 },
      { text: "🏳️‍🌈 Algo LGBT nos EUA", points: 1 },
      { text: "😰 Perseguição a gays", points: 2 },
      { text: "🚨 Caça às bruxas LGBT anos 50", points: 3 },
      { text: "📜 Perseguição governamental massiva a homossexuais nos anos 50", points: 4 },
    ],
  },
  {
    id: 10,
    text: "Quem foi Harvey Milk?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "🏳️‍🌈 Ativista LGBT", points: 1 },
      { text: "🗳️ Político gay", points: 2 },
      { text: "🌟 Primeiro político abertamente gay eleito nos EUA", points: 3 },
      { text: "✊ Supervisor de SF, primeiro político gay eleito, assassinado em 1978", points: 4 },
    ],
  },

  // 11-20: Cultura Pop LGBT Específica
  {
    id: 11,
    text: "Qual música é hino gay dos anos 70?",
    answers: [
      { text: "🎵 Não sei", points: 0 },
      { text: "💃 YMCA", points: 1 },
      { text: "🌈 I Will Survive", points: 2 },
      { text: "✨ I Will Survive (Gloria Gaynor)", points: 3 },
      { text: "👑 I Will Survive - hino de resistência e empoderamento LGBT", points: 4 },
    ],
  },
  {
    id: 12,
    text: "O que significa 'Yas Queen'?",
    answers: [
      { text: "👸 Sim, rainha", points: 0 },
      { text: "💁 Elogio", points: 1 },
      { text: "✨ Expressão de apoio", points: 2 },
      { text: "🎉 Celebração e empoderamento", points: 3 },
      { text: "👑 Expressão drag de celebração e apoio entusiástico", points: 4 },
    ],
  },
  {
    id: 13,
    text: "Quem é a 'Mãe dos Monstros'?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "👹 Personagem de filme?", points: 1 },
      { text: "🎤 Lady Gaga", points: 2 },
      { text: "👑 Lady Gaga (chama fãs de Little Monsters)", points: 3 },
      { text: "🌟 Lady Gaga - ícone LGBT que chama fãs de Little Monsters", points: 4 },
    ],
  },
  {
    id: 14,
    text: "O que é 'Voguing'?",
    answers: [
      { text: "📸 Posar para fotos", points: 0 },
      { text: "💃 Tipo de dança", points: 1 },
      { text: "🕺 Dança inspirada em poses", points: 2 },
      { text: "✨ Dança do ballroom com poses de revista", points: 3 },
      { text: "👗 Dança ballroom inspirada em poses de moda da Vogue", points: 4 },
    ],
  },
  {
    id: 15,
    text: "Qual série retrata a ballroom culture?",
    answers: [
      { text: "📺 Não sei", points: 0 },
      { text: "🎭 RuPaul's Drag Race", points: 1 },
      { text: "🌟 Pose", points: 2 },
      { text: "✨ Pose (série sobre ballroom em NY)", points: 3 },
      { text: "👑 Pose - série sobre ballroom LGBT nos anos 80/90 em NY", points: 4 },
    ],
  },
  {
    id: 16,
    text: "Quem é Bianca Del Rio?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "🎭 Drag queen", points: 1 },
      { text: "👑 Vencedora de Drag Race", points: 2 },
      { text: "🏆 Winner Season 6 Drag Race", points: 3 },
      { text: "😈 Insult comic drag queen, vencedora S6, maior turnê de drag", points: 4 },
    ],
  },
  {
    id: 17,
    text: "O que significa 'Shade' na cultura drag?",
    answers: [
      { text: "🌳 Sombra", points: 0 },
      { text: "😒 Algo negativo", points: 1 },
      { text: "💁 Indiretas", points: 2 },
      { text: "😏 Crítica sutil e elegante", points: 3 },
      { text: "👑 Arte de criticar com elegância e sutileza, sem ser óbvio", points: 4 },
    ],
  },
  {
    id: 18,
    text: "Qual drag brasileira foi para o Drag Race?",
    answers: [
      { text: "❓ Nenhuma", points: 0 },
      { text: "🇧🇷 Pabllo Vittar", points: 1 },
      { text: "💃 Glória Groove", points: 2 },
      { text: "🌟 Várias no Drag Race Brasil", points: 3 },
      { text: "👑 Várias: Drag Race Brasil existe desde 2023", points: 4 },
    ],
  },
  {
    id: 19,
    text: "O que é 'Reading' no drag?",
    answers: [
      { text: "📖 Ler", points: 0 },
      { text: "🗣️ Falar mal", points: 1 },
      { text: "😏 Zoar alguém", points: 2 },
      { text: "💁 Criticar com humor", points: 3 },
      { text: "👓 Arte de insultar com inteligência e humor na cara", points: 4 },
    ],
  },
  {
    id: 20,
    text: "Quem disse 'Sashay Away'?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "👸 Alguma drag queen", points: 1 },
      { text: "🎭 RuPaul", points: 2 },
      { text: "👑 RuPaul (elimina drags assim)", points: 3 },
      { text: "✨ RuPaul - frase icônica de eliminação no Drag Race", points: 4 },
    ],
  },

  // 21-30: Gírias e Linguagem LGBT
  {
    id: 21,
    text: "O que significa 'Dar close'?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "📸 Tirar foto de perto", points: 1 },
      { text: "💁 Aparecer", points: 2 },
      { text: "✨ Arrasar, chamar atenção", points: 3 },
      { text: "👑 Aparecer com estilo, arrasar, ser o centro das atenções", points: 4 },
    ],
  },
  {
    id: 22,
    text: "O que é 'Uó' no Pajubá?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "😮 Expressão de surpresa", points: 1 },
      { text: "👁️ Olho", points: 2 },
      { text: "👀 Olho (órgão)", points: 3 },
      { text: "👁️ Olho - 'dar uó' significa olhar/observar", points: 4 },
    ],
  },
  {
    id: 23,
    text: "O que significa 'Lacração'?",
    answers: [
      { text: "🔒 Fechar algo", points: 0 },
      { text: "💅 Fazer algo bem feito", points: 1 },
      { text: "✨ Arrasar", points: 2 },
      { text: "👑 Fazer algo perfeito e impressionante", points: 3 },
      { text: "🔥 Ato de arrasar, impressionar, fazer algo perfeito e icônico", points: 4 },
    ],
  },
  {
    id: 24,
    text: "O que é 'Aquendar' no Pajubá?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "📅 Agendar", points: 1 },
      { text: "🏃 Ir embora", points: 2 },
      { text: "🚶 Sair/ir embora", points: 3 },
      { text: "👋 Ir embora, sair, partir (do iorubá)", points: 4 },
    ],
  },
  {
    id: 25,
    text: "O que significa 'Erê' no Pajubá?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "👶 Criança", points: 1 },
      { text: "🧒 Criança ou jovem", points: 2 },
      { text: "👦 Menino/criança", points: 3 },
      { text: "👶 Criança (do iorubá, usado no candomblé)", points: 4 },
    ],
  },
  {
    id: 26,
    text: "O que é 'Montação'?",
    answers: [
      { text: "🏗️ Construir algo", points: 0 },
      { text: "💄 Maquiagem", points: 1 },
      { text: "👗 Se arrumar", points: 2 },
      { text: "✨ Transformação drag completa", points: 3 },
      { text: "🎭 Processo completo de transformação drag (roupa, maquiagem, peruca)", points: 4 },
    ],
  },
  {
    id: 27,
    text: "O que significa 'Dar pinta'?",
    answers: [
      { text: "🎨 Pintar algo", points: 0 },
      { text: "👀 Aparecer", points: 1 },
      { text: "💅 Demonstrar trejeitos", points: 2 },
      { text: "🌈 Demonstrar comportamento gay", points: 3 },
      { text: "✨ Demonstrar trejeitos ou comportamentos associados a ser gay", points: 4 },
    ],
  },
  {
    id: 28,
    text: "O que é 'Kiki' na cultura LGBT?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "🎉 Festa", points: 1 },
      { text: "💬 Conversa entre amigos", points: 2 },
      { text: "☕ Reunião informal para fofocar", points: 3 },
      { text: "👯 Reunião social LGBT para conversar, fofocar e se divertir", points: 4 },
    ],
  },
  {
    id: 29,
    text: "O que significa 'Okê' no Pajubá?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "👍 Ok/tudo bem", points: 1 },
      { text: "💰 Dinheiro", points: 2 },
      { text: "💵 Dinheiro/grana", points: 3 },
      { text: "💸 Dinheiro (do iorubá 'owó')", points: 4 },
    ],
  },
  {
    id: 30,
    text: "O que é 'Ilê' no Pajubá?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "🏠 Casa", points: 1 },
      { text: "🏡 Casa/residência", points: 2 },
      { text: "🏘️ Casa (do iorubá)", points: 3 },
      { text: "🏠 Casa/lar (do iorubá 'ilé', usado no candomblé)", points: 4 },
    ],
  },

  // 31-40: Ícones e Referências LGBT
  {
    id: 31,
    text: "Quem é Judy Garland para a comunidade gay?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "🎬 Atriz antiga", points: 1 },
      { text: "🌈 Ícone gay", points: 2 },
      { text: "⭐ Ícone gay clássico", points: 3 },
      { text: "👠 Ícone gay supremo, Dorothy de Mágico de Oz, símbolo de resiliência", points: 4 },
    ],
  },
  {
    id: 32,
    text: "O que é 'Friend of Dorothy'?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "👯 Amigo de alguém chamado Dorothy", points: 1 },
      { text: "🏳️‍🌈 Código gay antigo", points: 2 },
      { text: "🌈 Código secreto para identificar gays", points: 3 },
      { text: "🔐 Código secreto histórico para identificar homossexuais (ref. Judy Garland)", points: 4 },
    ],
  },
  {
    id: 33,
    text: "Quem é Sylvester (cantor)?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "🎤 Cantor disco", points: 1 },
      { text: "🌟 Cantor gay dos anos 70", points: 2 },
      { text: "✨ Ícone disco gay", points: 3 },
      { text: "👑 'Queen of Disco', ícone gay com falsete incrível, 'You Make Me Feel'", points: 4 },
    ],
  },
  {
    id: 34,
    text: "O que foi o 'Dia do Orgulho LGBT' originalmente?",
    answers: [
      { text: "🎉 Celebração LGBT", points: 0 },
      { text: "🏳️‍🌈 Parada gay", points: 1 },
      { text: "✊ Protesto por direitos", points: 2 },
      { text: "🗓️ Aniversário de Stonewall", points: 3 },
      { text: "🔥 Marcha de um ano após Stonewall (28 de junho de 1970)", points: 4 },
    ],
  },
  {
    id: 35,
    text: "Quem criou a bandeira LGBT?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "🏳️‍🌈 Algum ativista", points: 1 },
      { text: "🎨 Gilbert Baker", points: 2 },
      { text: "🌈 Gilbert Baker em 1978", points: 3 },
      { text: "✨ Gilbert Baker, artista e ativista, em 1978 em San Francisco", points: 4 },
    ],
  },
  {
    id: 36,
    text: "Quantas cores tinha a bandeira LGBT original?",
    answers: [
      { text: "🌈 6 cores", points: 0 },
      { text: "🎨 7 cores", points: 1 },
      { text: "✨ 8 cores", points: 2 },
      { text: "🏳️‍🌈 8 cores (incluía rosa e turquesa)", points: 3 },
      { text: "👑 8 cores: rosa, vermelho, laranja, amarelo, verde, turquesa, azul, roxo", points: 4 },
    ],
  },
  {
    id: 37,
    text: "O que é 'Camp' na estética gay?",
    answers: [
      { text: "🏕️ Acampamento", points: 0 },
      { text: "🎭 Algo exagerado", points: 1 },
      { text: "✨ Estética exagerada e teatral", points: 2 },
      { text: "🎨 Estética kitsch e irônica", points: 3 },
      { text: "👑 Estética de exagero, ironia, artificialidade e teatralidade", points: 4 },
    ],
  },
  {
    id: 38,
    text: "Quem é Paris is Burning?",
    answers: [
      { text: "🔥 Não sei", points: 0 },
      { text: "📽️ Filme", points: 1 },
      { text: "🎬 Documentário LGBT", points: 2 },
      { text: "🏳️‍🌈 Doc sobre ballroom", points: 3 },
      { text: "👑 Documentário icônico de 1990 sobre ballroom culture em NY", points: 4 },
    ],
  },
  {
    id: 39,
    text: "O que significa 'Serving looks'?",
    answers: [
      { text: "👀 Olhar para algo", points: 0 },
      { text: "👗 Estar bem vestido", points: 1 },
      { text: "✨ Estar arrasando no visual", points: 2 },
      { text: "💅 Entregar um visual incrível", points: 3 },
      { text: "👑 Entregar/apresentar um visual excepcional e impactante", points: 4 },
    ],
  },
  {
    id: 40,
    text: "Quem é a 'Drag Mother' no ballroom?",
    answers: [
      { text: "👵 Drag mais velha", points: 0 },
      { text: "👸 Drag experiente", points: 1 },
      { text: "🏠 Líder de um grupo", points: 2 },
      { text: "👑 Fundadora de uma House", points: 3 },
      { text: "✨ Mentora que acolhe e ensina drags mais novas em uma House", points: 4 },
    ],
  },

  // 41-50: Conhecimento Avançado
  {
    id: 41,
    text: "O que foi a 'Epidemia de AIDS' nos anos 80?",
    answers: [
      { text: "🦠 Doença que surgiu", points: 0 },
      { text: "😷 Crise de saúde", points: 1 },
      { text: "💔 Tragédia que matou muitos gays", points: 2 },
      { text: "🕯️ Crise que dizimou comunidade LGBT", points: 3 },
      { text: "⚰️ Crise devastadora que matou milhões, negligenciada por governos", points: 4 },
    ],
  },
  {
    id: 42,
    text: "Quem foi Pedro Zamora?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "🏳️‍🌈 Ativista LGBT", points: 1 },
      { text: "🎗️ Ativista HIV+", points: 2 },
      { text: "📺 Ativista HIV+ no MTV Real World", points: 3 },
      { text: "⭐ Educador cubano-americano HIV+ no Real World, mudou percepção sobre AIDS", points: 4 },
    ],
  },
  {
    id: 43,
    text: "O que é 'ACT UP'?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "✊ Grupo ativista", points: 1 },
      { text: "🎗️ Ativismo contra AIDS", points: 2 },
      { text: "📢 Organização de protesto AIDS", points: 3 },
      { text: "🔥 'AIDS Coalition to Unleash Power' - ativismo radical contra negligência AIDS", points: 4 },
    ],
  },
  {
    id: 44,
    text: "Qual o significado do triângulo rosa?",
    answers: [
      { text: "🔺 Símbolo LGBT", points: 0 },
      { text: "🏳️‍🌈 Símbolo de orgulho", points: 1 },
      { text: "😢 Símbolo de perseguição", points: 2 },
      { text: "⚠️ Usado pelos nazistas para marcar gays", points: 3 },
      { text: "💔 Símbolo nazista para identificar homossexuais em campos de concentração", points: 4 },
    ],
  },
  {
    id: 45,
    text: "O que foi 'Don't Ask, Don't Tell' nos EUA?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "🤐 Política de sigilo", points: 1 },
      { text: "🪖 Política militar", points: 2 },
      { text: "🏳️‍🌈 Política anti-gay militar", points: 3 },
      { text: "⚔️ Política militar que bania gays assumidos (1993-2011)", points: 4 },
    ],
  },
  {
    id: 46,
    text: "Quem é Larry Kramer?",
    answers: [
      { text: "❓ Não conheço", points: 0 },
      { text: "✊ Ativista LGBT", points: 1 },
      { text: "🎗️ Ativista AIDS", points: 2 },
      { text: "📢 Fundador do ACT UP", points: 3 },
      { text: "🔥 Escritor e ativista radical, fundou ACT UP e GMHC, autor de 'The Normal Heart'", points: 4 },
    ],
  },
  {
    id: 47,
    text: "O que é 'Queer Theory'?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "📚 Teoria sobre LGBTs", points: 1 },
      { text: "🎓 Estudo acadêmico LGBT", points: 2 },
      { text: "📖 Teoria que questiona normas de gênero", points: 3 },
      { text: "🧠 Campo acadêmico que desconstrui categorias fixas de gênero e sexualidade", points: 4 },
    ],
  },
  {
    id: 48,
    text: "Quem foi Alan Turing para a comunidade LGBT?",
    answers: [
      { text: "💻 Cientista da computação", points: 0 },
      { text: "🧮 Matemático famoso", points: 1 },
      { text: "🏳️‍🌈 Cientista gay perseguido", points: 2 },
      { text: "💔 Gênio gay condenado à castração química", points: 3 },
      { text: "⚰️ Pai da computação, perseguido por ser gay, castrado quimicamente, suicidou-se", points: 4 },
    ],
  },
  {
    id: 49,
    text: "O que significa 'Two-Spirit' nas culturas nativas?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "👻 Dois espíritos", points: 1 },
      { text: "🏳️‍🌈 Identidade LGBT nativa", points: 2 },
      { text: "⚧️ Terceiro gênero nativo americano", points: 3 },
      { text: "✨ Pessoas que incorporam espíritos masculino e feminino nas culturas nativas", points: 4 },
    ],
  },
  {
    id: 50,
    text: "Qual o lema do ACT UP?",
    answers: [
      { text: "❓ Não sei", points: 0 },
      { text: "✊ Lute pelos direitos", points: 1 },
      { text: "🎗️ Algo sobre AIDS", points: 2 },
      { text: "⏰ 'Silence = Death'", points: 3 },
      { text: "🔥 'SILENCE = DEATH' com triângulo rosa invertido", points: 4 },
    ],
  },
];
