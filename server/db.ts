import pg from "pg";

const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
// O Railway injeta automaticamente as variáveis de ambiente
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
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
