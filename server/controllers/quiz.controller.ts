import { Request, Response } from "express";
import { generateQuizToken, getTokenExpiry } from "../services/quizService.js";

/**
 * Gera um token de sessão para iniciar o quiz
 * GET /api/quiz/start
 */
export async function startQuiz(req: Request, res: Response) {
  try {
    const token = generateQuizToken();
    
    res.json({
      success: true,
      token,
      expiresIn: getTokenExpiry()
    });
  } catch (error) {
    console.error("Erro ao iniciar quiz:", error);
    res.status(500).json({ error: "Erro ao iniciar quiz" });
  }
}
