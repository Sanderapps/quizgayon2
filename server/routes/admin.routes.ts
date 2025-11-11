import { Router, Request, Response } from "express";
import { removeScore } from "../controllers/scores.controller.js";
import { removeMessage } from "../controllers/chat.controller.js";
import { 
  saveSuggestion, 
  cleanupFakeScores, 
  debugScores,
  fetchBans,
  banIp,
  unbanIp,
  clearAllMessages,
  banUser,
  deleteUserMessages,
  updateScore,
  deleteBulkScores,
  getAntiSpamConfig,
  updateAntiSpamConfig,
  getAdminStats,
  resetLeaderboard,
  addChangelogEntry,
  getChangelog
} from "../controllers/admin.controller.js";

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

// ==================== ROTAS DE PONTUAÇÕES ====================

// DELETE /api/scores/:id - Deletar pontuação
router.delete("/api/scores/:id", removeScore);

// PUT /api/admin/scores/:id - Atualizar pontuação (ADMIN)
router.put("/api/admin/scores/:id", checkAdminPassword, updateScore);

// DELETE /api/admin/scores/bulk - Deletar múltiplas pontuações (ADMIN)
router.delete("/api/admin/scores/bulk", checkAdminPassword, deleteBulkScores);

// ==================== ROTAS DE CHAT ====================

// DELETE /api/chat/messages/:id - Deletar mensagem (admin via HTTP)
router.delete("/api/chat/messages/:id", checkAdminPassword, removeMessage);

// DELETE /api/admin/chat/clear-all - Deletar todas as mensagens (ADMIN)
router.delete("/api/admin/chat/clear-all", checkAdminPassword, clearAllMessages);

// POST /api/admin/chat/ban-user - Banir usuário (ADMIN)
router.post("/api/admin/chat/ban-user", checkAdminPassword, banUser);

// DELETE /api/admin/chat/user/:apelido - Deletar mensagens de um usuário (ADMIN)
router.delete("/api/admin/chat/user/:apelido", checkAdminPassword, deleteUserMessages);

// ==================== ROTAS DE BANIMENTOS ====================

// GET /api/admin/bans - Listar IPs banidos (ADMIN)
router.get("/api/admin/bans", checkAdminPassword, fetchBans);

// POST /api/admin/bans - Banir IP manualmente (ADMIN)
router.post("/api/admin/bans", checkAdminPassword, banIp);

// DELETE /api/admin/bans/:ip - Desbanir IP (ADMIN)
router.delete("/api/admin/bans/:ip", checkAdminPassword, unbanIp);

// ==================== ROTAS DE ANTI-SPAM ====================

// GET /api/admin/antispam/config - Obter configuração anti-spam (ADMIN)
router.get("/api/admin/antispam/config", checkAdminPassword, getAntiSpamConfig);

// PUT /api/admin/antispam/config - Atualizar configuração anti-spam (ADMIN)
router.put("/api/admin/antispam/config", checkAdminPassword, updateAntiSpamConfig);

// ==================== ROTAS DE ESTATÍSTICAS ====================

// GET /api/admin/stats - Obter estatísticas expandidas (ADMIN)
router.get("/api/admin/stats", checkAdminPassword, getAdminStats);

// ==================== ROTAS DE DEBUG ====================

// DELETE /api/debug/cleanup-fake - Limpar entradas de spam (ADMIN)
router.delete("/api/debug/cleanup-fake", checkAdminPassword, cleanupFakeScores);

// GET /api/debug/scores - Ver dados brutos do banco (DEBUG)
router.get("/api/debug/scores", debugScores);

// DELETE /api/debug/reset-leaderboard - Resetar completamente o placar (ADMIN)
router.delete("/api/debug/reset-leaderboard", checkAdminPassword, resetLeaderboard);

// ==================== ROTAS DE CHANGELOG ====================

// POST /api/admin/changelog - Adicionar entrada no changelog (ADMIN)
router.post("/api/admin/changelog", checkAdminPassword, addChangelogEntry);

// GET /api/changelog - Buscar changelog (PÚBLICO)
router.get("/api/changelog", getChangelog);

// ==================== ROTAS DE SUGESTÕES ====================

// POST /api/suggestions - Salvar sugestão
router.post("/api/suggestions", saveSuggestion);

export default router;
