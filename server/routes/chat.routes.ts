import { Router } from "express";
import { fetchRecentMessages, fetchReports } from "../controllers/chat.controller.js";

const router = Router();

// GET /api/chat/recent - Ver mensagens recentes
router.get("/api/chat/recent", fetchRecentMessages);

// GET /api/chat/reports - Ver reports (admin)
router.get("/api/chat/reports", fetchReports);

export default router;
