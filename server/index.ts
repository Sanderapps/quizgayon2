import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { pool, initializeDatabase, type Score, type ChatMessage } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Senha de admin (pode ser configurada via variável de ambiente)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

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

  // ==================== SOCKET.IO (CHAT) ====================
  
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Mapa para controlar rate limiting (anti-spam)
  const userLastMessage = new Map<string, number>();
  const RATE_LIMIT_MS = 2000; // 2 segundos entre mensagens
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
        if (lastMessage && now - lastMessage < RATE_LIMIT_MS) {
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

  // POST /api/scores - Salvar nova pontuação
  app.post("/api/scores", async (req, res) => {
    try {
      const { apelido, pontuacao, tempo_segundos } = req.body as Score;

      // Validação básica
      if (!apelido || pontuacao === undefined || tempo_segundos === undefined) {
        return res.status(400).json({
          error: "Campos obrigatórios: apelido, pontuacao, tempo_segundos",
        });
      }

      // Validações de segurança
      const MAX_PONTUACAO = 60; // 15 perguntas * 4 pontos cada
      const MIN_TEMPO = 5; // Mínimo 5 segundos para completar o quiz
      const MAX_TEMPO = 3600; // Máximo 1 hora
      const MAX_APELIDO_LENGTH = 20;

      if (typeof pontuacao !== 'number' || pontuacao < 0 || pontuacao > MAX_PONTUACAO) {
        return res.status(400).json({
          error: `Pontuação inválida. Deve estar entre 0 e ${MAX_PONTUACAO}`,
        });
      }

      if (typeof tempo_segundos !== 'number' || tempo_segundos < MIN_TEMPO || tempo_segundos > MAX_TEMPO) {
        return res.status(400).json({
          error: `Tempo inválido. Deve estar entre ${MIN_TEMPO} e ${MAX_TEMPO} segundos`,
        });
      }

      if (typeof apelido !== 'string' || apelido.length === 0 || apelido.length > MAX_APELIDO_LENGTH) {
        return res.status(400).json({
          error: `Apelido inválido. Deve ter entre 1 e ${MAX_APELIDO_LENGTH} caracteres`,
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

      // Deletar entradas com pontuação > 60 ou tempo = 0
      const result = await pool.query(`
        DELETE FROM scores 
        WHERE pontuacao > 60 OR tempo_segundos < 5
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
