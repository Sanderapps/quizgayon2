-- Script para limpar todas as entradas de spam do Guardian
-- Execute este script no banco de dados PostgreSQL

-- 1. Deletar todas as entradas que começam com "Guardian"
DELETE FROM scores 
WHERE apelido ILIKE 'Guardian%';

-- 2. Deletar entradas com tempo suspeito (menos de 10 segundos)
DELETE FROM scores 
WHERE tempo_segundos < 10;

-- 3. Verificar quantas entradas foram deletadas
SELECT 
  COUNT(*) as total_entries_remaining,
  COUNT(CASE WHEN apelido ILIKE 'Guardian%' THEN 1 END) as guardian_entries_remaining
FROM scores;

-- 4. Mostrar top 10 do leaderboard limpo
SELECT 
  apelido,
  pontuacao,
  tempo_segundos,
  data_registro
FROM scores
ORDER BY pontuacao DESC, tempo_segundos ASC
LIMIT 10;
