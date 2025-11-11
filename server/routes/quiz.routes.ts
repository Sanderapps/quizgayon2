import { Router } from "express";
import { startQuiz } from "../controllers/quiz.controller.js";

const router = Router();

// GET /api/quiz/start - Gerar token de sessão para iniciar quiz
router.get("/api/quiz/start", startQuiz);

export default router;
