import { Router, Request, Response } from "express";
import { removeScore } from "../controllers/scores.controller.js";
import { removeMessage } from "../controllers/chat.controller.js";
import { saveSuggestion, cleanupFakeScores, debugScores } from "../controllers/admin.controller.js";

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

// DELETE /api/scores/:id - Deletar pontuação
router.delete("/api/scores/:id", removeScore);

// DELETE /api/chat/messages/:id - Deletar mensagem (admin via HTTP)
router.delete("/api/chat/messages/:id", checkAdminPassword, removeMessage);

// DELETE /api/debug/cleanup-fake - Limpar entradas de spam (ADMIN)
router.delete("/api/debug/cleanup-fake", checkAdminPassword, cleanupFakeScores);

// GET /api/debug/scores - Ver dados brutos do banco (DEBUG)
router.get("/api/debug/scores", debugScores);

// POST /api/suggestions - Salvar sugestão
router.post("/api/suggestions", saveSuggestion);

export default router;
