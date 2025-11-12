import { pool } from "../db.js";

export interface MusicRequest {
  id?: number;
  name: string;
  song: string;
  created_at?: Date;
  status?: string;
}

/**
 * Salva um novo pedido de música
 */
export async function saveMusicRequest(data: MusicRequest) {
  const { name = 'Anônimo', song } = data;
  
  const result = await pool.query(
    `INSERT INTO music_requests (name, song, created_at, status)
     VALUES ($1, $2, NOW(), 'pending')
     RETURNING *`,
    [name, song]
  );
  
  return result.rows[0];
}

/**
 * Busca todos os pedidos de música
 */
export async function getAllMusicRequests(limit: number = 100) {
  const result = await pool.query(
    `SELECT id, name, song, created_at, status
     FROM music_requests
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

/**
 * Atualiza o status de um pedido
 */
export async function updateRequestStatus(id: number, status: string) {
  const result = await pool.query(
    `UPDATE music_requests
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  
  return result.rows[0];
}
