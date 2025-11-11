import { pool } from "../db.js";

export interface ChatMessageData {
  apelido: string;
  mensagem: string;
  cor: string;
  emoji_avatar: string;
  tipo: string;
  gif_url?: string;
}

/**
 * Busca mensagens recentes do chat
 */
export async function getRecentMessages(limit: number = 50) {
  const result = await pool.query(
    `SELECT * FROM chat_messages 
     ORDER BY data_envio DESC 
     LIMIT $1`,
    [limit]
  );
  
  return result.rows.reverse();
}

/**
 * Salva uma nova mensagem no chat
 */
export async function saveMessage(data: ChatMessageData) {
  const result = await pool.query(
    `INSERT INTO chat_messages (apelido, mensagem, cor, emoji_avatar, tipo, gif_url, data_envio)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [data.apelido, data.mensagem, data.cor, data.emoji_avatar, data.tipo, data.gif_url || null]
  );
  
  return result.rows[0];
}

/**
 * Deleta uma mensagem específica
 */
export async function deleteMessage(id: number) {
  await pool.query(`DELETE FROM chat_messages WHERE id = $1`, [id]);
}

/**
 * Busca reports de mensagens
 */
export async function getReports() {
  const result = await pool.query(`
    SELECT r.*, m.apelido, m.mensagem 
    FROM chat_reports r
    JOIN chat_messages m ON r.message_id = m.id
    ORDER BY r.reported_at DESC
    LIMIT 100
  `);
  
  return result.rows;
}

/**
 * Salva um report de mensagem
 */
export async function saveReport(messageId: number, reason: string, reporterSocketId: string) {
  await pool.query(
    `INSERT INTO chat_reports (message_id, reason, reporter_socket_id) 
     VALUES ($1, $2, $3)`,
    [messageId, reason, reporterSocketId]
  );
}

/**
 * Conta quantos reports únicos uma mensagem tem
 */
export async function countUniqueReports(messageId: number): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(DISTINCT reporter_socket_id) as count 
     FROM chat_reports 
     WHERE message_id = $1`,
    [messageId]
  );
  
  return parseInt(result.rows[0].count);
}

/**
 * Filtra palavrões de um texto
 */
const BADWORDS = [
  "porra", "caralho", "puta", "merda", "fdp", "cu", "buceta", "pinto", "pau"
];

export function filterBadWords(text: string): string {
  let filtered = text;
  BADWORDS.forEach(word => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
}
