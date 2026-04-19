import { getQuizById, getDefaultQuiz } from "../data/quizzes";

export interface ResultShareMeta {
  quizId: string;
  quizTitle: string;
  percentage: number;
  resultTitle: string;
  headline: string;
  description: string;
  canonicalPath: string;
  imagePath: string;
}

const resultCopyByQuiz: Record<string, { low: string[]; high: string[] }> = {
  gay: {
    low: [
      "Você joga no modo contido. A presença está lá, mas entra em cena só quando vale a pena.",
      "Seu resultado ficou no campo da ironia controlada. Tem leitura boa de ambiente e zero pressa de impressionar.",
      "Você economiza carisma, mas sabe exatamente quando liberar presença e comentário certo.",
    ],
    high: [
      "Seu resultado veio com presença de palco. Tem repertório, timing e confiança suficiente para puxar a atenção.",
      "Você opera no modo espetáculo com método. Nada parece acidental, e isso faz parte do efeito.",
      "Sua energia é de quem entra sabendo o impacto que causa. O ambiente só se reorganiza em volta.",
    ],
  },
  politico: {
    low: [
      "Seu resultado puxa para ordem, planilha e argumento de custo. Você prefere convencer antes de incendiar.",
      "Você lê política como gestão, estrutura e consequência prática. O discurso vem depois da conta.",
      "Seu lado dominante prefere previsibilidade, regra clara e pouca tolerância para romantização.",
    ],
    high: [
      "Seu resultado puxa para mobilização, direito e conflito aberto. Você prefere debate vivo a neutralidade confortável.",
      "Você lê política pelo impacto coletivo e pela disputa real de poder. Centro demais não te convence.",
      "Seu resultado veio com vocabulário de transformação e pouca tolerância para cinismo performático.",
    ],
  },
  regional: {
    low: [
      "Seu resultado ficou mais perto do frio, da rotina organizada e do sotaque que entra de lado na frase.",
      "Você carrega energia de mesa posta, costume repetido e orgulho local sem precisar anunciar demais.",
      "Seu lado dominante tem disciplina de costume, afeto discreto e memória longa de tradição.",
    ],
    high: [
      "Seu resultado veio com calor, ritmo e resposta pronta. Você transforma cenário em presença.",
      "Você puxa para hospitalidade expansiva, fala afiada e repertório que chega antes do convite formal.",
      "Seu resultado carrega energia de rua, festa e linguagem viva. O ambiente rende mais quando você entra.",
    ],
  },
};

export function normalizeQuizTitle(title: string) {
  return title.replace(/^[^\wÀ-ÿ0-9]+/, "").trim();
}

export function getResultTitleFromPercentage(quizId: string, percentage: number) {
  const quiz = getQuizById(quizId) || getDefaultQuiz();
  const category = percentage < 50 ? quiz.categories.low : quiz.categories.high;
  const match = category.titles.find((titleRange) => percentage >= titleRange.min && percentage <= titleRange.max);
  return match?.title || category.titles[0].title;
}

export function getResultDescription(quizId: string, percentage: number) {
  const copy = resultCopyByQuiz[quizId] || resultCopyByQuiz.gay;
  const pool = percentage < 50 ? copy.low : copy.high;
  const bucketIndex = Math.min(pool.length - 1, Math.floor((percentage % 30) / 10));
  return pool[bucketIndex];
}

export function buildResultShareMeta(quizId: string, percentage: number): ResultShareMeta {
  const quiz = getQuizById(quizId) || getDefaultQuiz();
  const safePercentage = Number.isFinite(percentage) ? Math.max(0, Math.min(100, Math.round(percentage))) : 0;
  const quizTitle = normalizeQuizTitle(quiz.title);
  const resultTitle = getResultTitleFromPercentage(quiz.id, safePercentage);
  const description = getResultDescription(quiz.id, safePercentage);

  return {
    quizId: quiz.id,
    quizTitle,
    percentage: safePercentage,
    resultTitle,
    headline: `${safePercentage}% em ${quizTitle} • ${resultTitle}`,
    description: `${description} Abra o resultado completo e compare com o seu.`,
    canonicalPath: `/resultado/${quiz.id}/${safePercentage}`,
    imagePath: "/share-cover.svg",
  };
}

export function buildResultShareUrl(origin: string, quizId: string, percentage: number, points?: number, time?: number) {
  const meta = buildResultShareMeta(quizId, percentage);
  const url = new URL(meta.canonicalPath, origin);

  if (typeof points === "number") url.searchParams.set("pontos", String(points));
  if (typeof time === "number") url.searchParams.set("tempo", String(Math.round(time)));

  return url.toString();
}

export function buildShareMessage(quizId: string, percentage: number) {
  const meta = buildResultShareMeta(quizId, percentage);
  return `Fiz o quiz "${meta.quizTitle}" e caí em "${meta.resultTitle}" com ${meta.percentage}%.`;
}
