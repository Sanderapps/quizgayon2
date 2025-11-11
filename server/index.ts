import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { pool, initializeDatabase } from "./db.js";
import { cleanupOldEvents, cleanupExpiredBans } from "./middleware/antiSpam.js";
import routes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Senha de admin (pode ser configurada via variável de ambiente)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@dm1n321";

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
    },
  });

  // Map para rastrear última mensagem de cada usuário (cooldown)
  const userLastMessage = new Map<string, number>();
  const MESSAGE_COOLDOWN_MS = 2000; // 2 segundos

  io.on("connection", (socket) => {
    console.log("🟢 Novo usuário conectado:", socket.id);

    // Enviar mensagens recentes ao conectar
    pool.query(
      `SELECT * FROM chat_messages 
       ORDER BY data_envio DESC 
       LIMIT 50`
    ).then(result => {
      socket.emit("chat_history", result.rows.reverse());
    });

    // Receber nova mensagem
    socket.on("chat_message", async (data: { apelido: string; mensagem: string; cor: string; emoji_avatar: string; tipo: string; gif_url?: string }) => {
      try {
        // Cooldown de mensagens
        const lastMessageTime = userLastMessage.get(socket.id) || 0;
        const now = Date.now();
        
        if (now - lastMessageTime < MESSAGE_COOLDOWN_MS) {
          socket.emit("error", "Aguarde um pouco antes de enviar outra mensagem");
          return;
        }

        userLastMessage.set(socket.id, now);

        // Filtrar palavrões
        const filteredMessage = filterBadWords(data.mensagem);

        // Salvar mensagem no banco
        const result = await pool.query(
          `INSERT INTO chat_messages (apelido, mensagem, cor, emoji_avatar, tipo, gif_url) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [data.apelido, filteredMessage, data.cor, data.emoji_avatar, data.tipo, data.gif_url || null]
        );

        const newMessage = result.rows[0];

        // Broadcast para todos os clientes
        io.emit("new_message", newMessage);

        console.log(`💬 ${data.apelido}: ${filteredMessage.substring(0, 50)}...`);
      } catch (error) {
        console.error("❌ Erro ao processar mensagem:", error);
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
  
  // Usar rotas modulares
  app.use(routes);

  // ==================== ROTAS ADMIN EXTRAS (DEBUG) ====================
  
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

  // POST /api/admin/changelog - Adicionar entrada no changelog
  app.post("/api/admin/changelog", async (req, res) => {
    try {
      const adminPassword = req.headers["x-admin-password"];
      if (adminPassword !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Senha de administrador incorreta" });
      }

      const { version, description, emoji } = req.body;
      
      const result = await pool.query(
        `INSERT INTO changelog (version, description, emoji) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [version, description, emoji || "✨"]
      );

      res.json({ success: true, entry: result.rows[0] });
    } catch (error) {
      console.error("Erro ao adicionar changelog:", error);
      res.status(500).json({ error: "Erro ao adicionar changelog" });
    }
  });

  // GET /api/changelog - Buscar changelog
  app.get("/api/changelog", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM changelog 
         ORDER BY created_at DESC 
         LIMIT 10`
      );
      
      res.json({ success: true, changelog: result.rows });
    } catch (error) {
      console.error("Erro ao buscar changelog:", error);
      res.status(500).json({ error: "Erro ao buscar changelog" });
    }
  });

  // GET /api/admin/config - Ver configuração anti-spam
  app.get("/api/admin/config", async (req, res) => {
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

  // PUT /api/admin/config - Atualizar configuração anti-spam
  app.put("/api/admin/config", async (req, res) => {
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
