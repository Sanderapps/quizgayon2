import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { pool, initializeDatabase } from "./db.js";
import { cleanupOldEvents, cleanupExpiredBans } from "./middleware/antiSpam.js";
import routes from "./routes/index.js";
import { setupChatSocket } from "./sockets/chat.socket.js";
// Radio stream service removido - usando versão simples

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Senha de admin (pode ser configurada via variável de ambiente)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@dm1n321";

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
    console.log(`🔒 Admin password: ${ADMIN_PASSWORD}`);
    
    // Serviço de rádio simples é inicializado automaticamente
    console.log(`📻 Serviço de rádio ativo (versão simples)`);
  });
}

startServer().catch(console.error);
