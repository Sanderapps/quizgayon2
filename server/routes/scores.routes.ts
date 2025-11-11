import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { checkAntiSpam } from "../middleware/antiSpam.js";
import { ScoreSubmissionSchema } from "../schemas/validation.js";
import { validateQuizToken, markTokenAsUsed } from "./quiz.routes.js";

const router = Router();

// POST /api/scores - Salvar nova pontuação
router.post("/api/scores", async (req: Request, res: Response) => {
  try {
    // Validação com Zod
    const validationResult = ScoreSubmissionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return res.status(400).json({
        error: firstError.message,
        field: firstError.path.join('.')
      });
    }

    const { apelido, pontuacao, tempo_segundos, quiz_token } = validationResult.data;

    // Validação de token de sessão
    if (!validateQuizToken(quiz_token)) {
      return res.status(401).json({
        error: "Token inválido ou expirado. Inicie o quiz novamente.",
      });
    }

    // Marcar token como usado
    markTokenAsUsed(quiz_token);

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Aplicar sistema anti-spam
    const antiSpamResult = await checkAntiSpam(clientIp, apelido, pontuacao, tempo_segundos);
    if (!antiSpamResult.allowed) {
      return res.status(antiSpamResult.statusCode || 429).json({
        error: antiSpamResult.error
      });
    }

    // Inserir pontuação no banco de dados
    const result = await pool.query(
      `INSERT INTO scores (apelido, pontuacao, tempo_segundos) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [apelido, pontuacao, tempo_segundos]
    );

    res.status(201).json({
      success: true,
      score: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao salvar pontuação:", error);
    res.status(500).json({
      error: "Erro ao salvar pontuação",
    });
  }
});

// GET /api/leaderboard - Buscar placar de líderes
router.get("/api/leaderboard", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;

    // Buscar top scores ordenados por pontuação (DESC) e tempo (ASC)
    const result = await pool.query(
      `SELECT id, apelido, pontuacao, tempo_segundos, data_registro
       FROM scores
       ORDER BY pontuacao DESC, tempo_segundos ASC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      leaderboard: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Erro ao buscar placar:", error);
    res.status(500).json({
      error: "Erro ao buscar placar de líderes",
    });
  }
});

export default router;
