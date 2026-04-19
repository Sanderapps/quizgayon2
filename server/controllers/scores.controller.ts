import { Request, Response } from "express";
import { pool } from "../db.js";
import { ScoreSubmissionSchema } from "../schemas/validation.js";
import { validateQuizToken, markTokenAsUsed } from "../services/quizService.js";
import { saveScore, getLeaderboard, getStats, deleteScore, resetLeaderboard, getScoreById } from "../services/scoreService.js";
import { checkAntiSpam } from "../middleware/antiSpam.js";

/**
 * Submete uma nova pontuação
 * POST /api/scores
 */
export async function submitScore(req: Request, res: Response) {
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

    const { apelido, pontuacao, tempo_segundos, quiz_token, quiz_id = "gay" } = validationResult.data;

    console.log(`💾 Tentando salvar pontuação: apelido=${apelido}, pontuacao=${pontuacao}, quiz_id=${quiz_id}`);

    // Validação de token de sessão
    if (!(await validateQuizToken(quiz_token, quiz_id))) {
      console.error(`❌ Token inválido: ${quiz_token}`);
      return res.status(401).json({
        error: "Token inválido ou expirado. Inicie o quiz novamente.",
      });
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Aplicar sistema anti-spam
    const antiSpamResult = await checkAntiSpam(clientIp, apelido, pontuacao, tempo_segundos);
    if (!antiSpamResult.allowed) {
      return res.status(antiSpamResult.statusCode || 429).json({
        error: antiSpamResult.error
      });
    }

    const client = await pool.connect();
    let score;

    try {
      await client.query("BEGIN");

      const tokenMarkedAsUsed = await markTokenAsUsed(quiz_token, quiz_id, client);

      if (!tokenMarkedAsUsed) {
        await client.query("ROLLBACK");
        console.error(`❌ Falha ao consumir token antes de confirmar score: ${quiz_token}`);
        return res.status(409).json({
          error: "Sessão de quiz inválida. Inicie o quiz novamente.",
        });
      }

      score = await saveScore({
        apelido,
        pontuacao,
        tempo_segundos,
        quiz_id
      }, client);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    console.log(`✅ Pontuação salva com sucesso: ID=${score.id}, quiz_id=${quiz_id}`);

    res.status(201).json({
      success: true,
      score,
    });
  } catch (error) {
    console.error("Erro ao salvar pontuação:", error);
    res.status(500).json({
      error: "Erro ao salvar pontuação",
    });
  }
}

/**
 * Busca o placar de líderes
 * GET /api/leaderboard
 */
export async function fetchLeaderboard(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const quizId = req.query.quiz_id as string || "gay";

    console.log(`🏆 Buscando leaderboard: quiz_id=${quizId}, limit=${limit}`);

    const leaderboard = await getLeaderboard(quizId, limit);

    console.log(`📊 Leaderboard encontrado: ${leaderboard.length} entradas para quiz_id=${quizId}`);

    res.json({
      success: true,
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("Erro ao buscar placar:", error);
    res.status(500).json({
      error: "Erro ao buscar placar de líderes",
    });
  }
}

/**
 * Busca estatísticas do quiz
 * GET /api/stats (futuro)
 */
export async function fetchStats(req: Request, res: Response) {
  try {
    const quizId = req.query.quiz_id as string || "gay";
    const stats = await getStats(quizId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({
      error: "Erro ao buscar estatísticas",
    });
  }
}

export async function fetchScoreResult(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isFinite(id)) {
      return res.status(400).json({
        error: "Código de resultado inválido",
      });
    }

    const score = await getScoreById(id);

    if (!score) {
      return res.status(404).json({
        error: "Resultado não encontrado",
      });
    }

    res.json({
      success: true,
      score,
    });
  } catch (error) {
    console.error("Erro ao buscar resultado por código:", error);
    res.status(500).json({
      error: "Erro ao buscar resultado",
    });
  }
}

/**
 * Deleta uma pontuação específica (admin)
 * DELETE /api/scores/:id
 */
export async function removeScore(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteScore(id);

    if (!deleted) {
      return res.status(404).json({
        error: "Pontuação não encontrada",
      });
    }

    res.json({
      success: true,
      deleted,
    });
  } catch (error) {
    console.error("Erro ao deletar pontuação:", error);
    res.status(500).json({
      error: "Erro ao deletar pontuação",
    });
  }
}

/**
 * Reseta todo o placar (admin)
 * DELETE /api/debug/reset-leaderboard
 */
export async function resetLeaderboardController(req: Request, res: Response) {
  try {
    const deleted = await resetLeaderboard();
    
    res.json({
      success: true,
      message: "Placar resetado completamente",
      deleted_count: deleted.length,
      deleted_entries: deleted
    });
  } catch (error) {
    console.error("Erro ao resetar placar:", error);
    res.status(500).json({
      error: "Erro ao resetar placar",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
