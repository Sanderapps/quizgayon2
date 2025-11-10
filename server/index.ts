import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { pool, initializeDatabase, type Score, type ChatMessage } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  io.on("connection", (socket) => {
    console.log("✅ Usuário conectado ao chat:", socket.id);

    // Enviar histórico de mensagens ao conectar
    socket.on("request_history", async () => {
      try {
        const result = await pool.query(
          `SELECT * FROM chat_messages 
           ORDER BY data_envio DESC 
           LIMIT 50`
        );
        socket.emit("chat_history", result.rows.reverse());
      } catch (error) {
        console.error("❌ Erro ao buscar histórico:", error);
      }
    });

    // Receber e broadcast mensagens
    socket.on("send_message", async (data: { apelido: string; mensagem: string }) => {
      try {
        const { apelido, mensagem } = data;

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

        // Salvar no banco
        const result = await pool.query(
          `INSERT INTO chat_messages (apelido, mensagem) 
           VALUES ($1, $2) 
           RETURNING *`,
          [apelido, mensagem]
        );

        const newMessage = result.rows[0];

        // Broadcast para todos
        io.emit("new_message", newMessage);
      } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
        socket.emit("error", "Erro ao enviar mensagem");
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
  });
}

startServer().catch(console.error);
