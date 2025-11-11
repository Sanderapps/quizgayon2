import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { pool, initializeDatabase, type Score, type ChatMessage } from "./db.js";
import { checkAntiSpam, cleanupOldEvents, cleanupExpiredBans } from "./middleware/antiSpam.js";
import { ScoreSubmissionSchema } from "./schemas/validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Senha de admin (pode ser configurada via variável de ambiente)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@dm1n321";

// Sistema de tokens de sessão para validação de quiz
interface QuizToken {
  token: string;
  createdAt: number;
  used: boolean;
}

const quizTokens = new Map<string, QuizToken>();
const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos

// ==================== SISTEMA ANTI-SPAM ====================
// O sistema anti-spam agora utiliza persistência PostgreSQL.
// Veja: server/middleware/antiSpam.ts

// Função para gerar token único
function generateQuizToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Função para validar token
function validateQuizToken(token: string): boolean {
  const tokenData = quizTokens.get(token);
  if (!tokenData) return false;
  if (tokenData.used) return false;
  if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY_MS) {
    quizTokens.delete(token);
    return false;
  }
  return true;
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

// Lista de palavrões para filtro (básico)
const BADWORDS = [
  "porra", "caralho", "puta", "merda", "fdp", "cu", "buceta", "pinto", "pau"
];

function filterBadWords(text: string): string {
  let filtered = text;
  BADWORDS.forEach(word => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware para parsing de JSON
  app.use(express.json());

  // Inicializar banco de dados
  await initializeDatabase();

  // ==================== LIMPEZA PERIÓDICA ANTI-SPAM ====================
  // Limpar eventos antigos a cada 1 hora
  setInterval(async () => {
    await cleanupOldEvents();
  }, 60 * 60 * 1000); // 1 hora

  // Limpar banimentos expirados a cada 30 minutos
  setInterval(async () => {
    await cleanupExpiredBans();
  }, 30 * 60 * 1000); // 30 minutos

  // Executar limpeza inicial
  await cleanupOldEvents();
  await cleanupExpiredBans();

  // ==================== SOCKET.IO (CHAT) ====================
  
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Mapa para controlar rate limiting do chat (anti-spam)
  const userLastMessage = new Map<string, number>();
  const CHAT_RATE_LIMIT_MS = 2000; // 2 segundos entre mensagens
  const MESSAGES_PER_PAGE = 50;

  io.on("connection", (socket) => {
    console.log("✅ Usuário conectado ao chat:", socket.id);

    // Enviar histórico de mensagens ao conectar (primeira página)
    socket.on("request_history", async () => {
      try {
        const result = await pool.query(
          `SELECT * FROM chat_messages 
           ORDER BY data_envio DESC 
           LIMIT $1`,
          [MESSAGES_PER_PAGE]
        );
        socket.emit("chat_history", result.rows.reverse());
      } catch (error) {
        console.error("❌ Erro ao buscar histórico:", error);
      }
    });

    // Carregar mais mensagens (scroll infinito)
    socket.on("request_more_history", async (data: { page: number }) => {
      try {
        const { page } = data;
        const offset = (page - 1) * MESSAGES_PER_PAGE;

        const result = await pool.query(
          `SELECT * FROM chat_messages 
           ORDER BY data_envio DESC 
           LIMIT $1 OFFSET $2`,
          [MESSAGES_PER_PAGE, offset]
        );

        socket.emit("more_history", {
          messages: result.rows.reverse(),
          hasMore: result.rows.length === MESSAGES_PER_PAGE
        });
      } catch (error) {
        console.error("❌ Erro ao buscar mais mensagens:", error);
      }
    });

    // Receber e broadcast mensagens
    socket.on("send_message", async (data: { 
      apelido: string; 
      mensagem: string;
      cor?: string;
      emoji_avatar?: string;
      tipo?: 'text' | 'gif';
      gif_url?: string;
    }) => {
      try {
        const { apelido, mensagem, cor, emoji_avatar, tipo, gif_url } = data;

        // Validação
        if (!apelido || !mensagem || mensagem.length > 200) {
          socket.emit("error", "Mensagem inválida");
          return;
        }

        // Rate limiting (anti-spam)
        const now = Date.now();
        const lastMessage = userLastMessage.get(socket.id);
        if (lastMessage && now - lastMessage < CHAT_RATE_LIMIT_MS) {
          socket.emit("error", "Aguarde 2 segundos entre mensagens");
          return;
        }
        userLastMessage.set(socket.id, now);

        // Filtrar palavrões
        const filteredMessage = filterBadWords(mensagem);

        // Salvar no banco
        const result = await pool.query(
          `INSERT INTO chat_messages (apelido, mensagem, cor, emoji_avatar, tipo, gif_url) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [
            apelido, 
            filteredMessage, 
            cor || '#FF6B6B', 
            emoji_avatar || '😀',
            tipo || 'text',
            gif_url || null
          ]
        );

        const newMessage = result.rows[0];

        // Broadcast para todos
        io.emit("new_message", newMessage);
      } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
        socket.emit("error", "Erro ao enviar mensagem");
      }
    });

    // Deletar mensagem (admin)
    socket.on("delete_message", async (data: { messageId: number; adminPassword: string }) => {
      try {
        const { messageId, adminPassword } = data;

        // Verificar senha de admin
        if (adminPassword !== ADMIN_PASSWORD) {
          socket.emit("error", "Senha de administrador incorreta");
          return;
        }

        // Deletar mensagem
        await pool.query(
          `DELETE FROM chat_messages WHERE id = $1`,
          [messageId]
        );

        // Notificar todos os clientes
        io.emit("message_deleted", messageId);

        console.log(`🗑️ Mensagem ${messageId} deletada por admin`);
      } catch (error) {
        console.error("❌ Erro ao deletar mensagem:", error);
        socket.emit("error", "Erro ao deletar mensagem");
      }
    });

    // Reportar mensagem
    socket.on("report_message", async (data: { messageId: number; reason: string }) => {
      try {
        const { messageId, reason } = data;

        // Salvar report no banco com socket_id do reporter
        await pool.query(
          `INSERT INTO chat_reports (message_id, reason, reporter_socket_id) 
           VALUES ($1, $2, $3)`,
          [messageId, reason, socket.id]
        );

        console.log(`🚨 Mensagem ${messageId} reportada: ${reason}`);

        // AUTO-MODERAÇÃO: Verificar quantos reports únicos a mensagem tem
        const reportCount = await pool.query(
          `SELECT COUNT(DISTINCT reporter_socket_id) as count 
           FROM chat_reports 
           WHERE message_id = $1`,
          [messageId]
        );

        const uniqueReports = parseInt(reportCount.rows[0].count);

        // Se 3 ou mais pessoas diferentes reportaram, deletar automaticamente
        if (uniqueReports >= 3) {
          await pool.query(
            `DELETE FROM chat_messages WHERE id = $1`,
            [messageId]
          );

          // Notificar todos os clientes
          io.emit("message_deleted", messageId);

          console.log(`🛡️ AUTO-MODERAÇÃO: Mensagem ${messageId} deletada automaticamente (${uniqueReports} reports)`);
        }
      } catch (error) {
        console.error("❌ Erro ao reportar mensagem:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Usuário desconectado:", socket.id);
      userLastMessage.delete(socket.id);
    });
  });

  // ==================== ROTAS DE API ====================

  // GET /api/quiz/start - Gerar token de sessão para iniciar quiz
  app.get("/api/quiz/start", (req, res) => {
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

  // POST /api/scores - Salvar nova pontuação
  app.post("/api/scores", async (req, res) => {
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
      const tokenData = quizTokens.get(quiz_token);
      if (tokenData) {
        tokenData.used = true;
      }

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

  // POST /api/suggestions - Salvar sugestão
  app.post("/api/suggestions", async (req, res) => {
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

  // GET /api/leaderboard - Buscar placar de líderes
  app.get("/api/leaderboard", async (req, res) => {
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

  // DELETE /api/debug/cleanup-fake - Limpar entradas de spam (ADMIN)
  app.delete("/api/debug/cleanup-fake", async (req, res) => {
    try {
      const adminPassword = req.headers['x-admin-password'];

      // Verificar senha de admin
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(403).json({
          error: "Senha de administrador incorreta",
        });
      }

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
          WHERE s1.pontuacao = s2.pontuacao
            AND ABS(s1.tempo_segundos - s2.tempo_segundos) <= 2
            AND s1.data_registro::date = s2.data_registro::date
          GROUP BY s1.id
          HAVING COUNT(*) >= 2
        )
        DELETE FROM scores
        WHERE id IN (SELECT id FROM spam_patterns)
           OR id IN (SELECT id FROM duplicate_behavior)
        RETURNING id, apelido, pontuacao, tempo_segundos`
      );

      console.log(`🗑️ LIMPEZA: ${deleteResult.rows.length} entradas de spam deletadas`);

      res.json({
        success: true,
        message: `${deleteResult.rows.length} entradas de spam deletadas com sucesso`,
        deleted: deleteResult.rows,
      });
    } catch (error) {
      console.error("Erro ao limpar spam:", error);
      res.status(500).json({
        error: "Erro ao limpar entradas de spam",
      });
    }
  });

  // GET /api/stats - Estatísticas gerais
  app.get("/api/stats", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_jogadores,
          MAX(pontuacao) as pontuacao_maxima,
          AVG(pontuacao)::NUMERIC(10,2) as pontuacao_media,
          MIN(tempo_segundos) as tempo_minimo
        FROM scores
      `);

      res.json({
        success: true,
        stats: result.rows[0],
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({
        error: "Erro ao buscar estatísticas",
      });
    }
  });

  // DELETE /api/scores/:id - Deletar pontuação (opcional, para administração)
  app.delete("/api/scores/:id", async (req, res) => {
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

  // GET /api/chat/reports - Ver reports (admin)
  app.get("/api/chat/reports", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT r.*, m.apelido, m.mensagem 
        FROM chat_reports r
        JOIN chat_messages m ON r.message_id = m.id
        ORDER BY r.reported_at DESC
        LIMIT 100
      `);

      res.json({
        success: true,
        reports: result.rows,
      });
    } catch (error) {
      console.error("Erro ao buscar reports:", error);
      res.status(500).json({
        error: "Erro ao buscar reports",
      });
    }
  });

  // GET /api/chat/recent - Ver mensagens recentes (admin)
  app.get("/api/chat/recent", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM chat_messages 
         ORDER BY data_envio DESC 
         LIMIT 20`
      );

      res.json({
        success: true,
        messages: result.rows,
      });
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      res.status(500).json({
        error: "Erro ao buscar mensagens",
      });
    }
  });

  // DELETE /api/chat/messages/:id - Deletar mensagem (admin via HTTP)
  app.delete("/api/chat/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const adminPassword = req.headers["x-admin-password"];

      // Verificar senha de admin
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({
          error: "Senha de administrador incorreta",
        });
      }

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

  // DELETE /api/debug/cleanup-fake - Deletar entradas fake (pontuação > 60 ou tempo = 0)
  app.delete("/api/debug/cleanup-fake", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];

      // Verificar senha de admin
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({
          error: "Senha de administrador incorreta",
        });
      }

      // Deletar entradas com pontuação > 60 ou tempo < 15s
      const result = await pool.query(`
        DELETE FROM scores 
        WHERE pontuacao > 60 OR tempo_segundos < 15
        RETURNING *
      `);

      res.json({
        success: true,
        deleted_count: result.rowCount,
        deleted_entries: result.rows
      });
    } catch (error) {
      console.error("Erro ao limpar entradas fake:", error);
      res.status(500).json({
        error: "Erro ao limpar entradas fake",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // DELETE /api/debug/reset-leaderboard - Resetar completamente o placar (ADMIN)
  app.delete("/api/debug/reset-leaderboard", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];

      // Verificar senha de admin
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({
          error: "Senha de administrador incorreta",
        });
      }

      // Deletar TODAS as entradas do placar
      const result = await pool.query(`
        DELETE FROM scores 
        RETURNING *
      `);

      res.json({
        success: true,
        message: "Placar resetado completamente",
        deleted_count: result.rowCount,
        deleted_entries: result.rows
      });
    } catch (error) {
      console.error("Erro ao resetar placar:", error);
      res.status(500).json({
        error: "Erro ao resetar placar",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // GET /api/debug/scores - Ver dados brutos do banco (DEBUG)
  app.get("/api/debug/scores", async (req, res) => {
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
  });

  // ==================== NOVOS ENDPOINTS ADMIN ====================

  // POST /api/admin/changelog - Adicionar entrada no changelog
  app.post("/api/admin/changelog", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { version, date, emoji, color, text } = req.body;
      // Aqui você pode salvar no banco ou em arquivo JSON
      // Por simplicidade, retornamos sucesso
      res.json({ success: true, message: "Changelog atualizado" });
    } catch (error) {
      console.error("Erro ao adicionar changelog:", error);
      res.status(500).json({ error: "Erro ao adicionar changelog" });
    }
  });

  // DELETE /api/admin/chat/clear-all - Deletar todas as mensagens
  app.delete("/api/admin/chat/clear-all", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const result = await pool.query('DELETE FROM chat_messages RETURNING *');
      res.json({ success: true, deleted_count: result.rowCount });
    } catch (error) {
      console.error("Erro ao deletar todas mensagens:", error);
      res.status(500).json({ error: "Erro ao deletar mensagens" });
    }
  });

  // POST /api/admin/chat/ban-user - Banir apelido
  app.post("/api/admin/chat/ban-user", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { apelido } = req.body;
      // Criar tabela de banimentos de usuário se não existir
      await pool.query(`
        CREATE TABLE IF NOT EXISTS banned_users (
          id SERIAL PRIMARY KEY,
          apelido VARCHAR(50) UNIQUE NOT NULL,
          banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(
        'INSERT INTO banned_users (apelido) VALUES ($1) ON CONFLICT (apelido) DO NOTHING',
        [apelido]
      );

      res.json({ success: true, message: `Usuário ${apelido} banido` });
    } catch (error) {
      console.error("Erro ao banir usuário:", error);
      res.status(500).json({ error: "Erro ao banir usuário" });
    }
  });

  // PUT /api/admin/scores/:id - Editar pontuação
  app.put("/api/admin/scores/:id", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { id } = req.params;
      const { apelido, pontuacao, tempo_segundos } = req.body;

      const result = await pool.query(
        'UPDATE scores SET apelido = $1, pontuacao = $2, tempo_segundos = $3 WHERE id = $4 RETURNING *',
        [apelido, pontuacao, tempo_segundos, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Pontuação não encontrada" });
      }

      res.json({ success: true, score: result.rows[0] });
    } catch (error) {
      console.error("Erro ao editar pontuação:", error);
      res.status(500).json({ error: "Erro ao editar pontuação" });
    }
  });

  // DELETE /api/admin/scores/bulk - Deletar múltiplas pontuações
  app.delete("/api/admin/scores/bulk", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { ids } = req.body;
      const result = await pool.query(
        'DELETE FROM scores WHERE id = ANY($1) RETURNING *',
        [ids]
      );

      res.json({ success: true, deleted_count: result.rowCount });
    } catch (error) {
      console.error("Erro ao deletar pontuações:", error);
      res.status(500).json({ error: "Erro ao deletar pontuações" });
    }
  });

  // GET /api/admin/scores/export - Exportar placar como CSV
  app.get("/api/admin/scores/export", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const result = await pool.query(
        'SELECT id, apelido, pontuacao, tempo_segundos, data_registro FROM scores ORDER BY pontuacao DESC, tempo_segundos ASC'
      );

      // Gerar CSV
      let csv = 'ID,Apelido,Pontuação,Tempo (s),Data\n';
      result.rows.forEach(row => {
        csv += `${row.id},${row.apelido},${row.pontuacao},${row.tempo_segundos},${row.data_registro}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=placar.csv');
      res.send(csv);
    } catch (error) {
      console.error("Erro ao exportar placar:", error);
      res.status(500).json({ error: "Erro ao exportar placar" });
    }
  });

  // GET /api/admin/bans - Listar IPs banidos
  app.get("/api/admin/bans", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { getBannedIps } = await import("./middleware/antiSpam.js");
      const bans = await getBannedIps();
      res.json({ success: true, bans });
    } catch (error) {
      console.error("Erro ao listar banimentos:", error);
      res.status(500).json({ error: "Erro ao listar banimentos" });
    }
  });

  // DELETE /api/admin/bans/:ip - Remover banimento
  app.delete("/api/admin/bans/:ip", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { ip } = req.params;
      const { clearBan } = await import("./middleware/antiSpam.js");
      const success = await clearBan(ip);

      if (success) {
        res.json({ success: true, message: `Banimento de ${ip} removido` });
      } else {
        res.status(404).json({ error: "Banimento não encontrado" });
      }
    } catch (error) {
      console.error("Erro ao remover banimento:", error);
      res.status(500).json({ error: "Erro ao remover banimento" });
    }
  });

  // POST /api/admin/bans - Adicionar banimento manual
  app.post("/api/admin/bans", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { ip, reason, durationHours } = req.body;
      const expiresAt = new Date(Date.now() + (durationHours || 6) * 60 * 60 * 1000);

      await pool.query(
        'INSERT INTO anti_spam_bans (ip, reason, expires_at) VALUES ($1, $2, $3) ON CONFLICT (ip) DO UPDATE SET reason = $2, banned_at = CURRENT_TIMESTAMP, expires_at = $3',
        [ip, reason, expiresAt]
      );

      res.json({ success: true, message: `IP ${ip} banido por ${durationHours || 6} horas` });
    } catch (error) {
      console.error("Erro ao banir IP:", error);
      res.status(500).json({ error: "Erro ao banir IP" });
    }
  });

  // GET /api/admin/antispam/config - Obter configuração do anti-spam
  app.get("/api/admin/antispam/config", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { getAntiSpamConfig } = await import("./config/antiSpamConfig.js");
      const config = getAntiSpamConfig();
      res.json({ success: true, config });
    } catch (error) {
      console.error("Erro ao obter config:", error);
      res.status(500).json({ error: "Erro ao obter configuração" });
    }
  });

  // PUT /api/admin/antispam/config - Atualizar configuração do anti-spam
  app.put("/api/admin/antispam/config", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { updateAntiSpamConfig } = await import("./config/antiSpamConfig.js");
      const newConfig = updateAntiSpamConfig(req.body);
      res.json({ success: true, config: newConfig });
    } catch (error) {
      console.error("Erro ao atualizar config:", error);
      res.status(500).json({ error: "Erro ao atualizar configuração" });
    }
  });

  // GET /api/admin/stats - Estatísticas expandidas
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

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
      res.status(500).json({ error: "Erro ao obter estatísticas" });
    }
  });

  // ==================== ARQUIVOS ESTÁTICOS ====================

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
    console.log(`📊 API disponível em /api/scores e /api/leaderboard`);
    console.log(`💬 Chat WebSocket ativo`);
    console.log(`🔒 Admin password: ${ADMIN_PASSWORD}`);
  });
}

startServer().catch(console.error);
