import { Router, Request, Response } from "express";

const router = Router();

// Sistema de tokens de sessão para validação de quiz
interface QuizToken {
  token: string;
  createdAt: number;
  used: boolean;
}

const quizTokens = new Map<string, QuizToken>();
const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos

// Função para gerar token único
function generateQuizToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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

// GET /api/quiz/start - Gerar token de sessão para iniciar quiz
router.get("/api/quiz/start", (req: Request, res: Response) => {
  const token = generateQuizToken();
  quizTokens.set(token, {
    token,
    createdAt: Date.now(),
    used: false
  });
  
  res.json({
    success: true,
    token,
    expiresIn: TOKEN_EXPIRY_MS
  });
});

// Exportar funções auxiliares para uso em outras rotas
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

export function markTokenAsUsed(token: string): void {
  const tokenData = quizTokens.get(token);
  if (tokenData) {
    tokenData.used = true;
  }
}

export default router;
