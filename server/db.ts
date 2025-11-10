import pg from "pg";

const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
// O Railway injeta automaticamente as variáveis de ambiente
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Adicionar a configuração de SSL para o Railway
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  // Adicionar timeout para evitar que o servidor fique preso na inicialização
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// Função para inicializar o banco de dados e criar a tabela se não existir
export async function initializeDatabase() {
  try {
    // Criar tabela de pontuações se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        apelido TEXT NOT NULL,
        pontuacao INTEGER NOT NULL,
        tempo_segundos REAL NOT NULL,
        data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índice para otimizar a ordenação do placar
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scores_ranking 
      ON scores (pontuacao DESC, tempo_segundos ASC);
    `);

    // Criar tabela de mensagens do chat se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        apelido TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        cor TEXT DEFAULT '#FF6B6B',
        emoji_avatar TEXT DEFAULT '😀',
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar colunas cor e emoji_avatar se não existirem (migração)
    await pool.query(`
      ALTER TABLE chat_messages 
      ADD COLUMN IF NOT EXISTS cor TEXT DEFAULT '#FF6B6B',
      ADD COLUMN IF NOT EXISTS emoji_avatar TEXT DEFAULT '😀';
    `);

    // Adicionar colunas tipo e gif_url para suporte a GIFs (migração)
    await pool.query(`
      ALTER TABLE chat_messages 
      ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'text',
      ADD COLUMN IF NOT EXISTS gif_url TEXT;
    `);

    // Criar tabela de reports se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_reports (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        reporter_socket_id TEXT,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar coluna reporter_socket_id se não existir (migração)
    await pool.query(`
      ALTER TABLE chat_reports 
      ADD COLUMN IF NOT EXISTS reporter_socket_id TEXT;
    `);

    // Criar índice para otimizar a busca de mensagens recentes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_data 
      ON chat_messages (data_envio DESC);
    `);

    console.log("✅ Banco de dados inicializado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    throw error;
  }
}

// Interface TypeScript para o tipo de pontuação
export interface Score {
  id?: number;
  apelido: string;
  pontuacao: number;
  tempo_segundos: number;
  data_registro?: Date;
}

// Interface TypeScript para mensagens do chat
export interface ChatMessage {
  id?: number;
  apelido: string;
  mensagem: string;
  cor?: string;
  emoji_avatar?: string;
  data_envio?: Date;
  tipo?: 'text' | 'gif';
  gif_url?: string;
}
