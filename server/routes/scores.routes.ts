import { Router } from "express";
import { submitScore, fetchLeaderboard } from "../controllers/scores.controller.js";

const router = Router();

// POST /api/scores - Salvar nova pontuação
router.post("/api/scores", submitScore);

// GET /api/leaderboard - Buscar placar de líderes
router.get("/api/leaderboard", fetchLeaderboard);

export default router;
