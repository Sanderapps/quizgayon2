import { useEffect } from "react";

interface QuizTheme {
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  backgroundGradient: string;
}

/**
 * Hook para aplicar tema visual do quiz
 */
export function useQuizTheme(theme?: QuizTheme) {
  useEffect(() => {
    if (!theme) return;

    // Aplicar gradiente de fundo
    document.body.style.background = theme.backgroundGradient;

    // Aplicar variáveis CSS customizadas
    document.documentElement.style.setProperty('--quiz-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--quiz-secondary', theme.secondaryColor);

    return () => {
      // Limpar ao desmontar
      document.body.style.background = '';
      document.documentElement.style.removeProperty('--quiz-primary');
      document.documentElement.style.removeProperty('--quiz-secondary');
    };
  }, [theme]);
}
