import { Quiz } from "./types";
import { gayQuiz } from "./gayQuiz";
import { politicoQuiz } from "./politicoQuiz";
import { personalidadeQuiz } from "./personalidadeQuiz";

/**
 * Lista de todos os quizzes disponíveis
 */
export const allQuizzes: Quiz[] = [
  gayQuiz,
  // politicoQuiz,  // Descomentarquando estiver pronto
  // personalidadeQuiz,  // Descomentar quando estiver pronto
];

/**
 * Busca um quiz por ID ou slug
 */
export function getQuizById(idOrSlug: string): Quiz | undefined {
  return allQuizzes.find(q => q.id === idOrSlug || q.slug === idOrSlug);
}

/**
 * Busca o quiz padrão (primeiro da lista)
 */
export function getDefaultQuiz(): Quiz {
  return allQuizzes[0];
}

// Exportar tipos e quizzes individuais
export * from "./types";
export { gayQuiz, politicoQuiz, personalidadeQuiz };
