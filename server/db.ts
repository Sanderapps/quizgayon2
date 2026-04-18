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

    // Adicionar coluna quiz_id se não existir (migração para multi-quiz)
    await pool.query(`
      ALTER TABLE scores 
      ADD COLUMN IF NOT EXISTS quiz_id TEXT DEFAULT 'gay';
    `);

    // Atualizar registros existentes sem quiz_id
    await pool.query(`
      UPDATE scores 
      SET quiz_id = 'gay' 
      WHERE quiz_id IS NULL;
    `);

    // Criar índice para otimizar a ordenação do placar
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scores_ranking 
      ON scores (pontuacao DESC, tempo_segundos ASC);
    `);

    // Criar índice para otimizar filtro por quiz_id
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scores_quiz_id 
      ON scores (quiz_id);
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

    // Criar tabela de sugestões se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        apelido TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ==================== TABELAS ANTI-SPAM ====================
    
    // Tabela para armazenar eventos de submissão (rate limiting e detecção de padrões)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS anti_spam_events (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        apelido VARCHAR(50) NOT NULL,
        pontuacao INTEGER NOT NULL,
        tempo_segundos INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices para otimizar queries de anti-spam
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_anti_spam_events_ip_created 
      ON anti_spam_events (ip, created_at DESC);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_anti_spam_events_created 
      ON anti_spam_events (created_at DESC);
    `);

    // Tabela para armazenar IPs banidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS anti_spam_bans (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(45) UNIQUE NOT NULL,
        reason TEXT NOT NULL,
        banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    // Criar índices para otimizar verificação de banimento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_anti_spam_bans_ip_expires 
      ON anti_spam_bans (ip, expires_at);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_anti_spam_bans_expires 
      ON anti_spam_bans (expires_at);
    `);

    // Tabela para armazenar cooldowns (última submissão por IP)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS anti_spam_cooldowns (
        ip VARCHAR(45) PRIMARY KEY,
        last_submission_at TIMESTAMP NOT NULL
      );
    `);

    // ==================== TABELA DE TOKENS DE QUIZ ====================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_tokens (
        token TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL DEFAULT 'gay',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_tokens_expires_at
      ON quiz_tokens (expires_at);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_tokens_used_at
      ON quiz_tokens (used_at);
    `);

    // ==================== TABELA DE PEDIDOS DE MÚSICA ====================

    // Criar tabela de pedidos de música se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS music_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) DEFAULT 'Anônimo',
        song VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'pending'
      );
    `);

    // Criar índices para otimizar a busca de pedidos
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_music_requests_created_at
      ON music_requests(created_at DESC);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_music_requests_status
      ON music_requests(status);
    `);

    // ==================== TABELA DE CHANGELOG ====================

    // Criar tabela de changelog se não existir (usada pelo admin panel)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS changelog (
        id SERIAL PRIMARY KEY,
        version TEXT NOT NULL,
        description TEXT NOT NULL,
        emoji TEXT DEFAULT '✨',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_changelog_created
      ON changelog (created_at DESC);
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
