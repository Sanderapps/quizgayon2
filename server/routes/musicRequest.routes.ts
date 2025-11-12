import { Router } from "express";
import { submitMusicRequest, fetchMusicRequests, updateMusicRequestStatus } from "../controllers/musicRequest.controller.js";

const router = Router();

// Submeter novo pedido de música
router.post("/api/music-requests", submitMusicRequest);

// Buscar todos os pedidos
router.get("/api/music-requests", fetchMusicRequests);

// Atualizar status de um pedido
router.patch("/api/music-requests/:id", updateMusicRequestStatus);

export default router;
