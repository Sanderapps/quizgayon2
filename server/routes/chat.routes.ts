import { Router, Request, Response } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/chat/recent - Ver mensagens recentes
router.get("/api/chat/recent", async (req: Request, res: Response) => {
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

// GET /api/chat/reports - Ver reports (admin)
router.get("/api/chat/reports", async (req: Request, res: Response) => {
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

export default router;
