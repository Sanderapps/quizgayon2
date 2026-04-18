/**
 * Opção de resposta de uma pergunta
 */
export interface QuestionOption {
  texto: string;
  emoji?: string;
  pontos: number;
}

/**
 * Pergunta do quiz
 */
export interface Question {
  id: number;
  pergunta: string;
  emoji: string;
  opcoes: QuestionOption[];
}

/**
 * Faixa de título baseada em porcentagem
 */
export interface TitleRange {
  min: number;
  max: number;
  title: string;
  emoji: string;
}

/**
 * Categoria do quiz (ex: Alpha vs Divas, Lulista vs Bolsonarista)
 */
export interface QuizCategory {
  name: string;
  emoji: string;
  titles: TitleRange[];
  phrases: Record<number, string>;
  icons: Record<number, string>;
}

/**
 * Tema visual do quiz
 */
export interface QuizTheme {
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  backgroundGradient: string;
}

/**
 * Quiz completo
 */
export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  theme: QuizTheme;
  categories: {
    low: QuizCategory;
    high: QuizCategory;
  };
  questions: Question[];
}
