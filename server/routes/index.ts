import { Router } from "express";
import quizRoutes from "./quiz.routes.js";
import scoresRoutes from "./scores.routes.js";
import chatRoutes from "./chat.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

// Registrar todas as rotas
router.use(quizRoutes);
router.use(scoresRoutes);
router.use(chatRoutes);
router.use(adminRoutes);

export default router;
