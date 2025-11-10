import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function queryLeaderboard() {
  try {
    const result = await pool.query(`
      SELECT id, apelido, pontuacao, tempo_segundos, data_registro 
      FROM scores 
      ORDER BY pontuacao DESC, tempo_segundos ASC 
      LIMIT 5
    `);
    
    console.log("📊 Top 5 Entradas do Leaderboard:\n");
    console.table(result.rows);
    
    await pool.end();
  } catch (error) {
    console.error("❌ Erro ao consultar banco:", error);
    process.exit(1);
  }
}

queryLeaderboard();
