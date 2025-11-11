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

/**
 * Busca todos os IPs banidos
 * GET /api/admin/bans
 */
export async function fetchBans(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT ip, reason, banned_at, expires_at
      FROM anti_spam_bans
      WHERE expires_at > NOW()
      ORDER BY banned_at DESC
    `);

    res.json({
      success: true,
      bans: result.rows
    });
  } catch (error) {
    console.error("Erro ao buscar banimentos:", error);
    res.status(500).json({
      error: "Erro ao buscar banimentos"
    });
  }
}

/**
 * Bane um IP manualmente
 * POST /api/admin/bans
 */
export async function banIp(req: Request, res: Response) {
  try {
    const { ip, reason, durationHours } = req.body;

    if (!ip || !reason) {
      return res.status(400).json({
        error: "Campos obrigatórios: ip, reason"
      });
    }

    const duration = durationHours || 24; // Padrão: 24 horas
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO anti_spam_bans (ip, reason, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (ip) DO UPDATE
       SET reason = $2, expires_at = $3, banned_at = NOW()`,
      [ip, reason, expiresAt]
    );

    res.json({
      success: true,
      message: `IP ${ip} banido por ${duration} horas`
    });
  } catch (error) {
    console.error("Erro ao banir IP:", error);
    res.status(500).json({
      error: "Erro ao banir IP"
    });
  }
}

/**
 * Remove um banimento de IP
 * DELETE /api/admin/bans/:ip
 */
export async function unbanIp(req: Request, res: Response) {
  try {
    const { ip } = req.params;

    await pool.query(
      `DELETE FROM anti_spam_bans WHERE ip = $1`,
      [ip]
    );

    res.json({
      success: true,
      message: `IP ${ip} desbanido`
    });
  } catch (error) {
    console.error("Erro ao desbanir IP:", error);
    res.status(500).json({
      error: "Erro ao desbanir IP"
    });
  }
}

/**
 * Deleta todas as mensagens do chat
 * DELETE /api/admin/chat/clear-all
 */
export async function clearAllMessages(req: Request, res: Response) {
  try {
    const result = await pool.query(`DELETE FROM chat_messages RETURNING *`);

    res.json({
      success: true,
      deleted: result.rowCount,
      message: "Todas as mensagens foram deletadas"
    });
  } catch (error) {
    console.error("Erro ao deletar mensagens:", error);
    res.status(500).json({
      error: "Erro ao deletar mensagens"
    });
  }
}

/**
 * Bane um usuário (deleta suas mensagens e adiciona à lista de banidos)
 * POST /api/admin/chat/ban-user
 */
export async function banUser(req: Request, res: Response) {
  try {
    const { apelido } = req.body;

    if (!apelido) {
      return res.status(400).json({
        error: "Campo obrigatório: apelido"
      });
    }

    // Deletar todas as mensagens do usuário
    const deleteResult = await pool.query(
      `DELETE FROM chat_messages WHERE apelido = $1 RETURNING *`,
      [apelido]
    );

    res.json({
      success: true,
      deleted: deleteResult.rowCount,
      message: `Usuário ${apelido} banido e ${deleteResult.rowCount} mensagens deletadas`
    });
  } catch (error) {
    console.error("Erro ao banir usuário:", error);
    res.status(500).json({
      error: "Erro ao banir usuário"
    });
  }
}

/**
 * Deleta todas as mensagens de um usuário específico
 * DELETE /api/admin/chat/user/:apelido
 */
export async function deleteUserMessages(req: Request, res: Response) {
  try {
    const { apelido } = req.params;

    const result = await pool.query(
      `DELETE FROM chat_messages WHERE apelido = $1 RETURNING *`,
      [apelido]
    );

    res.json({
      success: true,
      deleted: result.rowCount,
      message: `${result.rowCount} mensagens de ${apelido} deletadas`
    });
  } catch (error) {
    console.error("Erro ao deletar mensagens do usuário:", error);
    res.status(500).json({
      error: "Erro ao deletar mensagens do usuário"
    });
  }
}

/**
 * Atualiza uma pontuação específica
 * PUT /api/admin/scores/:id
 */
export async function updateScore(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { apelido, pontuacao, tempo_segundos } = req.body;

    const result = await pool.query(
      `UPDATE scores 
       SET apelido = $1, pontuacao = $2, tempo_segundos = $3
       WHERE id = $4
       RETURNING *`,
      [apelido, pontuacao, tempo_segundos, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Pontuação não encontrada"
      });
    }

    res.json({
      success: true,
      score: result.rows[0]
    });
  } catch (error) {
    console.error("Erro ao atualizar pontuação:", error);
    res.status(500).json({
      error: "Erro ao atualizar pontuação"
    });
  }
}

/**
 * Deleta múltiplas pontuações
 * DELETE /api/admin/scores/bulk
 */
export async function deleteBulkScores(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: "Campo obrigatório: ids (array de números)"
      });
    }

    const result = await pool.query(
      `DELETE FROM scores WHERE id = ANY($1) RETURNING *`,
      [ids]
    );

    res.json({
      success: true,
      deleted: result.rowCount,
      message: `${result.rowCount} pontuações deletadas`
    });
  } catch (error) {
    console.error("Erro ao deletar pontuações:", error);
    res.status(500).json({
      error: "Erro ao deletar pontuações"
    });
  }
}

/**
 * Busca a configuração do anti-spam
 * GET /api/admin/antispam/config
 */
export async function getAntiSpamConfig(req: Request, res: Response) {
  try {
    // Importar a configuração do módulo
    const { getAntiSpamConfig: getConfig } = await import("../config/antiSpamConfig.js");
    const config = getConfig();

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error("Erro ao obter configuração anti-spam:", error);
    res.status(500).json({
      error: "Erro ao obter configuração anti-spam"
    });
  }
}

/**
 * Atualiza a configuração do anti-spam
 * PUT /api/admin/antispam/config
 */
export async function updateAntiSpamConfig(req: Request, res: Response) {
  try {
    const { updateAntiSpamConfig: updateConfig } = await import("../config/antiSpamConfig.js");
    const newConfig = updateConfig(req.body);

    res.json({
      success: true,
      config: newConfig
    });
  } catch (error) {
    console.error("Erro ao atualizar configuração anti-spam:", error);
    res.status(500).json({
      error: "Erro ao atualizar configuração anti-spam"
    });
  }
}

/**
 * Busca estatísticas expandidas do sistema
 * GET /api/admin/stats
 */
export async function getAdminStats(req: Request, res: Response) {
  try {
    const totalMessages = await pool.query('SELECT COUNT(*) as count FROM chat_messages');
    const totalScores = await pool.query('SELECT COUNT(*) as count FROM scores');
    const avgScore = await pool.query('SELECT AVG(pontuacao) as avg FROM scores');
    const topChatters = await pool.query(`
      SELECT apelido, COUNT(*) as message_count 
      FROM chat_messages 
      GROUP BY apelido 
      ORDER BY message_count DESC 
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        totalMessages: parseInt(totalMessages.rows[0].count),
        totalScores: parseInt(totalScores.rows[0].count),
        avgScore: parseFloat(avgScore.rows[0].avg || 0).toFixed(2),
        topChatters: topChatters.rows
      }
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({
      error: "Erro ao obter estatísticas"
    });
  }
}
