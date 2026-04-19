import { Router } from "express";
import { submitScore, fetchLeaderboard, fetchScoreResult } from "../controllers/scores.controller.js";

const router = Router();

// POST /api/scores - Salvar nova pontuação
router.post("/api/scores", submitScore);

// GET /api/scores/:id - Buscar um resultado salvo
router.get("/api/scores/:id", fetchScoreResult);

// GET /api/leaderboard - Buscar placar de líderes
router.get("/api/leaderboard", fetchLeaderboard);

export default router;
