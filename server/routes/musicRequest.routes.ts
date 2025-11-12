import { Router } from "express";
import { submitMusicRequest, fetchMusicRequests, updateMusicRequestStatus } from "../controllers/musicRequest.controller.js";

const router = Router();

// Submeter novo pedido de música
router.post("/music-requests", submitMusicRequest);

// Buscar todos os pedidos
router.get("/music-requests", fetchMusicRequests);

// Atualizar status de um pedido
router.patch("/music-requests/:id", updateMusicRequestStatus);

export default router;
