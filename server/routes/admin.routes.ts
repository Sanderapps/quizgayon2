import { Router } from "express";
import { removeScore } from "../controllers/scores.controller.js";
import { removeMessage } from "../controllers/chat.controller.js";
import { requireAdminPassword } from "../auth/adminAuth.js";
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

// ==================== ROTAS DE PONTUAÇÕES ====================

// DELETE /api/scores/:id - Deletar pontuação
router.delete("/api/scores/:id", requireAdminPassword, removeScore);

// PUT /api/admin/scores/:id - Atualizar pontuação (ADMIN)
router.put("/api/admin/scores/:id", requireAdminPassword, updateScore);

// DELETE /api/admin/scores/bulk - Deletar múltiplas pontuações (ADMIN)
router.delete("/api/admin/scores/bulk", requireAdminPassword, deleteBulkScores);

// ==================== ROTAS DE CHAT ====================

// DELETE /api/chat/messages/:id - Deletar mensagem (admin via HTTP)
router.delete("/api/chat/messages/:id", requireAdminPassword, removeMessage);

// DELETE /api/admin/chat/clear-all - Deletar todas as mensagens (ADMIN)
router.delete("/api/admin/chat/clear-all", requireAdminPassword, clearAllMessages);

// POST /api/admin/chat/ban-user - Banir usuário (ADMIN)
router.post("/api/admin/chat/ban-user", requireAdminPassword, banUser);

// DELETE /api/admin/chat/user/:apelido - Deletar mensagens de um usuário (ADMIN)
router.delete("/api/admin/chat/user/:apelido", requireAdminPassword, deleteUserMessages);

// ==================== ROTAS DE BANIMENTOS ====================

// GET /api/admin/bans - Listar IPs banidos (ADMIN)
router.get("/api/admin/bans", requireAdminPassword, fetchBans);

// POST /api/admin/bans - Banir IP manualmente (ADMIN)
router.post("/api/admin/bans", requireAdminPassword, banIp);

// DELETE /api/admin/bans/:ip - Desbanir IP (ADMIN)
router.delete("/api/admin/bans/:ip", requireAdminPassword, unbanIp);

// ==================== ROTAS DE ANTI-SPAM ====================

// GET /api/admin/antispam/config - Obter configuração anti-spam (ADMIN)
router.get("/api/admin/antispam/config", requireAdminPassword, getAntiSpamConfig);

// PUT /api/admin/antispam/config - Atualizar configuração anti-spam (ADMIN)
router.put("/api/admin/antispam/config", requireAdminPassword, updateAntiSpamConfig);

// ==================== ROTAS DE ESTATÍSTICAS ====================

// GET /api/admin/stats - Obter estatísticas expandidas (ADMIN)
router.get("/api/admin/stats", requireAdminPassword, getAdminStats);

// ==================== ROTAS DE DEBUG ====================

// DELETE /api/debug/cleanup-fake - Limpar entradas de spam (ADMIN)
router.delete("/api/debug/cleanup-fake", requireAdminPassword, cleanupFakeScores);

// GET /api/debug/scores - Ver dados brutos do banco (DEBUG)
router.get("/api/debug/scores", requireAdminPassword, debugScores);

// DELETE /api/debug/reset-leaderboard - Resetar completamente o placar (ADMIN)
router.delete("/api/debug/reset-leaderboard", requireAdminPassword, resetLeaderboard);

// ==================== ROTAS DE CHANGELOG ====================

// POST /api/admin/changelog - Adicionar entrada no changelog (ADMIN)
router.post("/api/admin/changelog", requireAdminPassword, addChangelogEntry);

// GET /api/changelog - Buscar changelog (PÚBLICO)
router.get("/api/changelog", getChangelog);

// ==================== ROTAS DE SUGESTÕES ====================

// POST /api/suggestions - Salvar sugestão
router.post("/api/suggestions", saveSuggestion);

export default router;
