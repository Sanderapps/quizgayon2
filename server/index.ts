import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { pool, initializeDatabase } from "./db.js";
import { assertAdminPasswordConfigured } from "./auth/adminAuth.js";
import { cleanupOldEvents, cleanupExpiredBans } from "./middleware/antiSpam.js";
import routes from "./routes/index.js";
import { setupChatSocket } from "./sockets/chat.socket.js";
import { cleanupExpiredQuizTokens } from "./services/quizService.js";
// Radio stream service removido - usando versão simples

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente apenas em desenvolvimento
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Debug: log DATABASE_URL em produção
if (process.env.NODE_ENV === "production") {
  console.log("🔧 DATABASE_URL configurada:", process.env.DATABASE_URL ? "✅ SIM" : "❌ NÃO");
  if (process.env.DATABASE_URL) {
    console.log("🔗 Connection string:", process.env.DATABASE_URL.substring(0, 30) + "...");
  }
}

async function startServer() {
  assertAdminPasswordConfigured();

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

  // Limpar tokens expirados/usados a cada 10 minutos
  setInterval(async () => {
    await cleanupExpiredQuizTokens();
  }, 10 * 60 * 1000); // 10 minutos

  // Executar limpeza inicial
  await cleanupOldEvents();
  await cleanupExpiredBans();
  await cleanupExpiredQuizTokens();

  // ==================== SOCKET.IO (CHAT) ====================

  // Restringir origens permitidas para segurança
  const allowedOrigins = process.env.SOCKET_ORIGINS
    ? process.env.SOCKET_ORIGINS.split(",")
    : [
        "https://web-production-b5e40.up.railway.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
      ];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  // Configurar socket do chat
  setupChatSocket(io);

  // Conectar Socket.IO ao serviço de rádio para sincronização
  const { radioStreamSimpleService } = await import('./services/radioStreamSimple.js');
  radioStreamSimpleService.setSocketIO(io);

  // ==================== ROTAS DE API ====================
  
  // Usar rotas modulares
  app.use(routes);

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

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
    console.log(`📊 API disponível em /api/scores e /api/leaderboard`);
    console.log(`💬 Chat WebSocket ativo`);

    // Serviço de rádio simples é inicializado automaticamente
    console.log(`📻 Serviço de rádio ativo (versão simples)`);
  });

  // ==================== GRACEFUL SHUTDOWN ====================

  async function gracefulShutdown(signal: string) {
    console.log(`\n🛑 Recebido sinal ${signal}. Encerrando gracefully...`);

    // Parar de aceitar novas conexões
    server.close(async () => {
      console.log("🔌 Servidor HTTP encerrado");

      // Fechar conexões do pool PostgreSQL
      try {
        await pool.end();
        console.log("🗄️ Pool PostgreSQL encerrado");
      } catch (error) {
        console.error("❌ Erro ao fechar pool:", error);
      }

      // Fechar conexões do Socket.IO
      try {
        await io.close();
        console.log("🔌 Socket.IO encerrado");
      } catch (error) {
        console.error("❌ Erro ao fechar Socket.IO:", error);
      }

      console.log("✅ Shutdown completo");
      process.exit(0);
    });

    // Forçar saída se demorar mais de 10 segundos
    setTimeout(() => {
      console.error("⚠️ Shutdown demorou mais de 10s. Forçando saída.");
      process.exit(1);
    }, 10000);
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer().catch(console.error);
