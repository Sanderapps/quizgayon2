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

// Sistema de tokens de sessão para validação de quiz
interface QuizToken {
  token: string;
  createdAt: number;
  used: boolean;
}

const quizTokens = new Map<string, QuizToken>();
const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos

// ==================== SISTEMA ANTI-SPAM ====================

// 1. Rate limiting por IP: 3 submissões por minuto
interface RateLimitData {
  submissions: number[];
}
const ipRateLimit = new Map<string, RateLimitData>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_SUBMISSIONS_PER_WINDOW = 3;

// 2. Cooldown entre submissões: 30 segundos
const ipCooldown = new Map<string, number>();
const COOLDOWN_MS = 30 * 1000; // 30 segundos

// 3. Detecção de padrões suspeitos
interface SubmissionPattern {
  apelido: string;
  pontuacao: number;
  timestamp: number;
}
const recentSubmissions = new Map<string, SubmissionPattern[]>();
const PATTERN_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

// 4. Detecção de prefixo de nome (anti-variação)
interface PrefixSubmission {
  fullName: string;
  timestamp: number;
}
const prefixSubmissions = new Map<string, PrefixSubmission[]>();
const PREFIX_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const MAX_PREFIX_SUBMISSIONS = 3; // Máximo 3 submissões com mesmo prefixo em 5 minutos

// 5. Detecção de comportamento idêntico (pontuação + tempo + IP)
interface BehaviorPattern {
  pontuacao: number;
  tempo_segundos: number;
  timestamp: number;
  apelido: string;
}
const behaviorPatterns = new Map<string, BehaviorPattern[]>();
const BEHAVIOR_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_IDENTICAL_BEHAVIOR = 2; // Máximo 2 submissões com pontuação+tempo idênticos em 10 min

// 6. Sistema de banimento de IP por 2 horas
interface IpBan {
  bannedAt: number;
  reason: string;
}
const bannedIps = new Map<string, IpBan>();
const BAN_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas

// Função para extrair prefixo do nome (antes do hífen ou número)
function extractNamePrefix(apelido: string): string {
  // Remove números e hífens do final: "Guardian-1234" -> "Guardian"
  return apelido.replace(/[-_]?\d+$/, '').toLowerCase().trim();
}

// Função para detectar padrão de nome com variação (Nome-XXXX)
function isNameVariationPattern(apelido: string): boolean {
  // Detecta padrões como "Guardian-1234", "Nome_5678", etc.
  return /^[a-zA-Z]+[-_]\d+$/.test(apelido);
}

// Função para normalizar nome (remover caracteres especiais e substituições)
function normalizeNameForPattern(apelido: string): string {
  return apelido
    .toLowerCase()
    .replace(/[0-9@\$\*\!\?]/g, '') // Remove números e símbolos
    .replace(/[4áàâã]/g, 'a')
    .replace(/[3éê]/g, 'e')
    .replace(/[1í]/g, 'i')
    .replace(/[0óôõ]/g, 'o')
    .replace(/[ú]/g, 'u')
    .replace(/[\s\-_]/g, '') // Remove espaços, hífens e underscores
    .trim();
}

// Função para verificar se IP está banido
function isIpBanned(ip: string): { banned: boolean; reason?: string; timeLeft?: number } {
  const banData = bannedIps.get(ip);
  if (!banData) return { banned: false };
  
  const now = Date.now();
  const timeElapsed = now - banData.bannedAt;
  
  if (timeElapsed >= BAN_DURATION_MS) {
    bannedIps.delete(ip);
    return { banned: false };
  }
  
  const timeLeft = Math.ceil((BAN_DURATION_MS - timeElapsed) / 1000 / 60); // minutos
  return { banned: true, reason: banData.reason, timeLeft };
}

// Função para banir IP
function banIp(ip: string, reason: string): void {
  bannedIps.set(ip, {
    bannedAt: Date.now(),
    reason
  });
  console.log(`[BAN] IP ${ip} banido por 2 horas. Razão: ${reason}`);
}

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
  for (const [token, data] of quizTokens.entries()) {
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
      const { apelido, pontuacao, tempo_segundos, quiz_token } = req.body as Score & { quiz_token?: string };

      // Validação de token de sessão
      if (!quiz_token) {
        return res.status(401).json({
          error: "Token de sessão obrigatório. Inicie o quiz primeiro.",
        });
      }

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
      const now = Date.now();

      // ========== VERIFICAÇÃO DE BANIMENTO ==========
      const banStatus = isIpBanned(clientIp);
      if (banStatus.banned) {
        return res.status(403).json({
          error: `Seu IP foi banido por spam. Tempo restante: ${banStatus.timeLeft} minutos. Razão: ${banStatus.reason}`,
        });
      }

      // ========== REGRA 1: Rate Limiting - 3 submissões por minuto ==========
      let rateLimitData = ipRateLimit.get(clientIp);
      if (!rateLimitData) {
        rateLimitData = { submissions: [] };
        ipRateLimit.set(clientIp, rateLimitData);
      }

      // Remover submissões antigas (fora da janela de 1 minuto)
      rateLimitData.submissions = rateLimitData.submissions.filter(
        timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS
      );

      if (rateLimitData.submissions.length >= MAX_SUBMISSIONS_PER_WINDOW) {
        return res.status(429).json({
          error: `Limite de ${MAX_SUBMISSIONS_PER_WINDOW} submissões por minuto atingido. Aguarde antes de tentar novamente.`,
        });
      }

      // ========== REGRA 2: Cooldown - 30 segundos entre submissões ==========
      const lastCooldown = ipCooldown.get(clientIp);
      if (lastCooldown && now - lastCooldown < COOLDOWN_MS) {
        const waitTime = Math.ceil((COOLDOWN_MS - (now - lastCooldown)) / 1000);
        return res.status(429).json({
          error: `Aguarde ${waitTime} segundos antes de enviar outra pontuação`,
        });
      }

      // ========== REGRA 3: Detecção de padrões suspeitos ==========
      let userPatterns = recentSubmissions.get(clientIp);
      if (!userPatterns) {
        userPatterns = [];
        recentSubmissions.set(clientIp, userPatterns);
      }

      // Remover submissões antigas (fora da janela de 5 minutos)
      userPatterns = userPatterns.filter(
        pattern => now - pattern.timestamp < PATTERN_WINDOW_MS
      );
      recentSubmissions.set(clientIp, userPatterns);

      // Regra 3a: Mais de 2 submissões no mesmo segundo
      const sameSecondSubmissions = userPatterns.filter(
        pattern => Math.floor(pattern.timestamp / 1000) === Math.floor(now / 1000)
      );
      if (sameSecondSubmissions.length >= 2) {
        return res.status(429).json({
          error: "Padrão de spam detectado: múltiplas submissões no mesmo segundo bloqueadas",
        });
      }

      // Regra 3b: Mais de 3 submissões com mesma pontuação em menos de 5 minutos
      const samePontuacaoSubmissions = userPatterns.filter(
        pattern => pattern.pontuacao === pontuacao
      );
      if (samePontuacaoSubmissions.length >= 3) {
        return res.status(429).json({
          error: "Padrão de spam detectado: múltiplas submissões idênticas bloqueadas",
        });
      }

      // Regra 3c: Mesmo apelido + mesma pontuação + menos de 60 segundos
      const duplicateSubmission = userPatterns.find(
        pattern => 
          pattern.apelido === apelido && 
          pattern.pontuacao === pontuacao && 
          now - pattern.timestamp < 60 * 1000
      );
      if (duplicateSubmission) {
        return res.status(429).json({
          error: "Submissão duplicada detectada. Aguarde 60 segundos para enviar a mesma pontuação novamente.",
        });
      }

      // ========== REGRA 4: Validação de variação de nome (Nome-XXXX) ==========
      if (isNameVariationPattern(apelido)) {
        return res.status(400).json({
          error: "Padrão de nome suspeito detectado. Use um apelido sem números aleatórios no final.",
        });
      }

      // ========== REGRA 5: Detecção de comportamento idêntico (pontuação + tempo) ==========
      let behaviorData = behaviorPatterns.get(clientIp);
      if (!behaviorData) {
        behaviorData = [];
        behaviorPatterns.set(clientIp, behaviorData);
      }

      // Remover padrões antigos (fora da janela de 10 minutos)
      behaviorData = behaviorData.filter(
        pattern => now - pattern.timestamp < BEHAVIOR_WINDOW_MS
      );
      behaviorPatterns.set(clientIp, behaviorData);

      // Detectar submissões com pontuação E tempo idênticos (tolerância de ±2 segundos)
      const identicalBehavior = behaviorData.filter(
        pattern => 
          pattern.pontuacao === pontuacao && 
          Math.abs(pattern.tempo_segundos - tempo_segundos) <= 2
      );

      if (identicalBehavior.length >= MAX_IDENTICAL_BEHAVIOR) {
        // Banir IP por 2 horas
        banIp(clientIp, `Múltiplas submissões com pontuação ${pontuacao} e tempo ${tempo_segundos}s idênticos`);
        return res.status(403).json({
          error: "Padrão de spam detectado! Seu IP foi BANIDO por 2 horas por múltiplas submissões com pontuação e tempo idênticos.",
        });
      }

      // ========== REGRA 1 (Avançada): Detecção de prefixo - 3 submissões com mesmo prefixo em 5 minutos ==========
      const namePrefix = extractNamePrefix(apelido);
      let prefixData = prefixSubmissions.get(namePrefix);
      if (!prefixData) {
        prefixData = [];
        prefixSubmissions.set(namePrefix, prefixData);
      }

      // Remover submissões antigas do prefixo
      prefixData = prefixData.filter(
        submission => now - submission.timestamp < PREFIX_WINDOW_MS
      );
      prefixSubmissions.set(namePrefix, prefixData);

      if (prefixData.length >= MAX_PREFIX_SUBMISSIONS) {
        return res.status(429).json({
          error: `Limite de submissões para nomes similares a "${namePrefix}" atingido. Aguarde 5 minutos ou use um nome diferente.`,
        });
      }

      // Registrar submissão atual
      rateLimitData.submissions.push(now);
      ipCooldown.set(clientIp, now);
      userPatterns.push({ apelido, pontuacao, timestamp: now });
      prefixData.push({ fullName: apelido, timestamp: now });
      behaviorData.push({ apelido, pontuacao, tempo_segundos, timestamp: now });

      // Validação básica
      if (!apelido || pontuacao === undefined || tempo_segundos === undefined) {
        return res.status(400).json({
          error: "Campos obrigatórios: apelido, pontuacao, tempo_segundos",
        });
      }

      // Validações de segurança
      const MAX_PONTUACAO = 60; // 15 perguntas * 4 pontos cada
      
      // ========== REGRA 5: Tempo mínimo - 45 segundos para completar o quiz ==========
      const MIN_TEMPO = 45; // Mínimo 45 segundos para completar o quiz (tempo realista)
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
