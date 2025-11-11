import { Router, Request, Response } from "express";
import { pool } from "../db.js";

const router = Router();

// Senha de admin (pode ser configurada via variável de ambiente)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@dm1n321";

// Middleware de autenticação admin
function checkAdminPassword(req: Request, res: Response, next: any) {
  const adminPassword = req.headers["x-admin-password"];
  
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({
      error: "Senha de administrador incorreta",
    });
  }
  
  next();
}

// DELETE /api/scores/:id - Deletar pontuação
router.delete("/api/scores/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM scores WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Pontuação não encontrada",
      });
    }

    res.json({
      success: true,
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao deletar pontuação:", error);
    res.status(500).json({
      error: "Erro ao deletar pontuação",
    });
  }
});

// DELETE /api/chat/messages/:id - Deletar mensagem (admin via HTTP)
router.delete("/api/chat/messages/:id", checkAdminPassword, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Deletar mensagem
    await pool.query(
      `DELETE FROM chat_messages WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: "Mensagem deletada",
    });
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    res.status(500).json({
      error: "Erro ao deletar mensagem",
    });
  }
});

// DELETE /api/debug/cleanup-fake - Limpar entradas de spam (ADMIN)
router.delete("/api/debug/cleanup-fake", checkAdminPassword, async (req: Request, res: Response) => {
  try {
    // Deletar entradas com padrões de spam:
    // 1. Tempo muito baixo (menos de 10 segundos)
    // 2. Entradas com mesma pontuação e tempo idêntico (tolerância de ±2s) do mesmo IP
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
});

// POST /api/suggestions - Salvar sugestão
router.post("/api/suggestions", async (req: Request, res: Response) => {
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
});

export default router;
