import type { PoolClient } from "pg";
import { pool } from "../db.js";

export interface ScoreData {
  apelido: string;
  pontuacao: number;
  tempo_segundos: number;
  quiz_id?: string;
}

/**
 * Salva uma nova pontuação no banco de dados
 */
export async function saveScore(data: ScoreData, client: PoolClient | typeof pool = pool) {
  const { apelido, pontuacao, tempo_segundos, quiz_id = "gay" } = data;
  
  const result = await client.query(
    `INSERT INTO scores (apelido, pontuacao, tempo_segundos, quiz_id, data_registro)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [apelido, pontuacao, tempo_segundos, quiz_id]
  );
  
  return result.rows[0];
}

/**
 * Busca o placar de líderes ordenado por pontuação e tempo
 */
export async function getLeaderboard(quizId: string = "gay", limit: number = 100) {
  const result = await pool.query(
    `SELECT id, apelido, pontuacao, tempo_segundos, data_registro
     FROM scores
     WHERE quiz_id = $1
     ORDER BY pontuacao DESC, tempo_segundos ASC
     LIMIT $2`,
    [quizId, limit]
  );
  
  return result.rows;
}

/**
 * Busca estatísticas gerais do quiz
 */
export async function getStats(quizId: string = "gay") {
  const result = await pool.query(
    `SELECT 
       COUNT(*) as total_jogadores,
       ROUND(AVG(pontuacao)::numeric, 2) as media_pontuacao,
       MAX(pontuacao) as maior_pontuacao,
       MIN(pontuacao) as menor_pontuacao
     FROM scores
     WHERE quiz_id = $1`,
    [quizId]
  );
  
  return result.rows[0];
}

/**
 * Deleta uma pontuação específica
 */
export async function deleteScore(id: number) {
  const result = await pool.query(
    `DELETE FROM scores WHERE id = $1 RETURNING *`,
    [id]
  );
  
  return result.rows[0];
}

/**
 * Deleta todas as pontuações (reset do placar)
 */
export async function resetLeaderboard() {
  const result = await pool.query(`DELETE FROM scores RETURNING *`);
  return result.rows;
}
