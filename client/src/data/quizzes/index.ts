import { Quiz } from "./types";
import { gayQuiz } from "./gayQuiz";
import { politicoQuiz } from "./politicoQuiz";
import { regionalQuiz } from "./regionalQuiz";

/**
 * Lista de todos os quizzes disponíveis
 * Sistema Multi-Quiz: gay, político, regional
 */
export const allQuizzes: Quiz[] = [
  gayQuiz,        // ✅ Completo (50 perguntas, 33 títulos)
  politicoQuiz,   // ✅ Completo (50 perguntas, 34 títulos)
  regionalQuiz,   // ✅ Completo (50 perguntas, 34 títulos)
];

/**
 * Busca um quiz por ID ou slug
 */
export function getQuizById(idOrSlug: string): Quiz | undefined {
  return allQuizzes.find(q => q.id === idOrSlug || q.slug === idOrSlug);
}

/**
 * Busca o quiz padrão (primeiro da lista = gay)
 */
export function getDefaultQuiz(): Quiz {
  return allQuizzes[0];
}

// Exportar tipos e quizzes individuais
export * from "./types";
export { gayQuiz, politicoQuiz, regionalQuiz };
