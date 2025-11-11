import { Request, Response } from "express";
import { getRecentMessages, getReports, deleteMessage } from "../services/chatService.js";

/**
 * Busca mensagens recentes do chat
 * GET /api/chat/recent
 */
export async function fetchRecentMessages(req: Request, res: Response) {
  try {
    const messages = await getRecentMessages();
    
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    res.status(500).json({
      error: "Erro ao buscar mensagens",
    });
  }
}

/**
 * Busca reports de mensagens (admin)
 * GET /api/chat/reports
 */
export async function fetchReports(req: Request, res: Response) {
  try {
    const reports = await getReports();
    
    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Erro ao buscar reports:", error);
    res.status(500).json({
      error: "Erro ao buscar reports",
    });
  }
}

/**
 * Deleta uma mensagem (admin)
 * DELETE /api/chat/messages/:id
 */
export async function removeMessage(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await deleteMessage(id);
    
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
}
