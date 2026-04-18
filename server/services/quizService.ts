import { randomUUID } from "crypto";
import type { PoolClient } from "pg";
import { pool } from "../db.js";

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Gera um token único para iniciar uma sessão de quiz
 */
export async function generateQuizToken(quizId: string = "gay"): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await pool.query(
    `INSERT INTO quiz_tokens (token, quiz_id, expires_at)
     VALUES ($1, $2, $3)`,
    [token, quizId, expiresAt]
  );

  return token;
}

/**
 * Valida se um token é válido e não foi usado
 */
export async function validateQuizToken(token: string, quizId?: string): Promise<boolean> {
  const params: Array<string> = [token];
  let query = `
    SELECT 1
    FROM quiz_tokens
    WHERE token = $1
      AND used_at IS NULL
      AND expires_at > NOW()
  `;

  if (quizId) {
    params.push(quizId);
    query += ` AND quiz_id = $2`;
  }

  const result = await pool.query(query, params);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Marca um token como usado (para evitar reuso)
 */
export async function markTokenAsUsed(
  token: string,
  quizId?: string,
  client: PoolClient | typeof pool = pool
): Promise<boolean> {
  const params: Array<string> = [token];
  let query = `
    UPDATE quiz_tokens
    SET used_at = NOW()
    WHERE token = $1
      AND used_at IS NULL
      AND expires_at > NOW()
  `;

  if (quizId) {
    params.push(quizId);
    query += ` AND quiz_id = $2`;
  }

  query += ` RETURNING token`;

  const result = await client.query(query, params);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Retorna o tempo de expiração em milissegundos
 */
export function getTokenExpiry(): number {
  return TOKEN_EXPIRY_MS;
}

export async function cleanupExpiredQuizTokens(): Promise<void> {
  await pool.query(
    `DELETE FROM quiz_tokens
     WHERE expires_at <= NOW()
        OR used_at IS NOT NULL`
  );
}
