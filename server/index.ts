import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { pool, initializeDatabase, type Score } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware para parsing de JSON
  app.use(express.json());

  // Inicializar banco de dados
  await initializeDatabase();

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
