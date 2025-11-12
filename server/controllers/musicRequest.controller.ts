import { Request, Response } from "express";
import { saveMusicRequest, getAllMusicRequests, updateRequestStatus } from "../services/musicRequestService.js";

/**
 * Submete um novo pedido de música
 * POST /api/music-requests
 */
export async function submitMusicRequest(req: Request, res: Response) {
  try {
    const { name, song } = req.body;

    if (!song || song.trim().length === 0) {
      return res.status(400).json({
        error: "O campo 'song' é obrigatório"
      });
    }

    const request = await saveMusicRequest({
      name: name || 'Anônimo',
      song: song.trim()
    });

    res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    console.error("Erro ao salvar pedido de música:", error);
    res.status(500).json({
      error: "Erro ao salvar pedido de música"
    });
  }
}

/**
 * Busca todos os pedidos de música
 * GET /api/music-requests
 */
export async function fetchMusicRequests(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const requests = await getAllMusicRequests(limit);

    res.json({
      success: true,
      requests,
      total: requests.length
    });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({
      error: "Erro ao buscar pedidos de música"
    });
  }
}

/**
 * Atualiza o status de um pedido
 * PATCH /api/music-requests/:id
 */
export async function updateMusicRequestStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "O campo 'status' é obrigatório"
      });
    }

    const updated = await updateRequestStatus(id, status);

    if (!updated) {
      return res.status(404).json({
        error: "Pedido não encontrado"
      });
    }

    res.json({
      success: true,
      request: updated
    });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    res.status(500).json({
      error: "Erro ao atualizar pedido"
    });
  }
}
