// Gerenciar tokens de sessão do quiz
interface QuizToken {
  token: string;
  createdAt: number;
  used: boolean;
}

const quizTokens = new Map<string, QuizToken>();
const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Gera um token único para iniciar uma sessão de quiz
 */
export function generateQuizToken(): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  quizTokens.set(token, {
    token,
    createdAt: Date.now(),
    used: false
  });
  
  return token;
}

/**
 * Valida se um token é válido e não foi usado
 */
export function validateQuizToken(token: string): boolean {
  const tokenData = quizTokens.get(token);
  
  if (!tokenData) return false;
  if (tokenData.used) return false;
  if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY_MS) {
    quizTokens.delete(token);
    return false;
  }
  
  return true;
}

/**
 * Marca um token como usado (para evitar reuso)
 */
export function markTokenAsUsed(token: string): void {
  const tokenData = quizTokens.get(token);
  if (tokenData) {
    tokenData.used = true;
  }
}

/**
 * Retorna o tempo de expiração em milissegundos
 */
export function getTokenExpiry(): number {
  return TOKEN_EXPIRY_MS;
}

// Limpar tokens expirados a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of Array.from(quizTokens.entries())) {
    if (now - data.createdAt > TOKEN_EXPIRY_MS) {
      quizTokens.delete(token);
    }
  }
}, 10 * 60 * 1000);
