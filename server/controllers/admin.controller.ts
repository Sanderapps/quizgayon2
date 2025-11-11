import { Request, Response } from "express";
import { pool } from "../db.js";

/**
 * Salva uma sugestão
 * POST /api/suggestions
 */
export async function saveSuggestion(req: Request, res: Response) {
  try {
    const { apelido, mensagem } = req.body;

    // Validação básica
    if (!apelido || !mensagem) {
      return res.status(400).json({
        error: "Campos obrigatórios: apelido, mensagem",
      });
    }

    if (typeof apelido !== 'string' || apelido.length === 0 || apelido.length > 30) {
      return res.status(400).json({
        error: "Apelido inválido. Deve ter entre 1 e 30 caracteres",
      });
    }

    if (typeof mensagem !== 'string' || mensagem.length === 0 || mensagem.length > 500) {
      return res.status(400).json({
        error: "Mensagem inválida. Deve ter entre 1 e 500 caracteres",
      });
    }

    // Inserir sugestão no banco de dados
    const result = await pool.query(
      `INSERT INTO suggestions (apelido, mensagem) 
       VALUES ($1, $2) 
       RETURNING *`,
      [apelido.trim(), mensagem.trim()]
    );

    console.log(`💡 Nova sugestão de ${apelido}: ${mensagem.substring(0, 50)}...`);

    res.status(201).json({
      success: true,
      suggestion: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao salvar sugestão:", error);
    res.status(500).json({
      error: "Erro ao salvar sugestão",
    });
  }
}

/**
 * Limpa entradas de spam do placar
 * DELETE /api/debug/cleanup-fake
 */
export async function cleanupFakeScores(req: Request, res: Response) {
  try {
    // Deletar entradas com padrões de spam
    const deleteResult = await pool.query(
      `WITH spam_patterns AS (
        SELECT id, apelido, pontuacao, tempo_segundos
        FROM scores
        WHERE tempo_segundos < 10
      ),
      duplicate_behavior AS (
        SELECT s1.id
        FROM scores s1
        JOIN scores s2 ON s1.id != s2.id
          AND s1.pontuacao = s2.pontuacao
          AND ABS(s1.tempo_segundos - s2.tempo_segundos) <= 2
          AND s1.apelido = s2.apelido
      )
      DELETE FROM scores
      WHERE id IN (SELECT id FROM spam_patterns)
         OR id IN (SELECT id FROM duplicate_behavior)
      RETURNING *`
    );

    res.json({
      success: true,
      deleted: deleteResult.rows.length,
      entries: deleteResult.rows,
    });
  } catch (error) {
    console.error("Erro ao limpar spam:", error);
    res.status(500).json({
      error: "Erro ao limpar spam",
    });
  }
}

/**
 * Ver dados brutos do banco (debug)
 * GET /api/debug/scores
 */
export async function debugScores(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT id, apelido, pontuacao, tempo_segundos, data_registro 
      FROM scores 
      ORDER BY pontuacao DESC, tempo_segundos ASC 
      LIMIT 10
    `);
    
    res.json({
      total: result.rows.length,
      scores: result.rows
    });
  } catch (error) {
    console.error("Erro ao buscar scores:", error);
    res.status(500).json({
      error: "Erro ao buscar scores",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
