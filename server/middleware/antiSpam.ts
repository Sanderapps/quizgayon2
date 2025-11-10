/**
 * Sistema Anti-Spam e Anti-Fraude com Persistência PostgreSQL
 * 
 * Este módulo implementa múltiplas camadas de proteção para garantir
 * a integridade do placar de líderes do quiz.
 * 
 * Camadas de Proteção:
 * 1. Rate Limiting por IP (3 submissões/minuto)
 * 2. Cooldown entre submissões (30 segundos)
 * 3. Detecção de padrões suspeitos
 * 4. Detecção de variação de nome (Guardian-1234, Guardian-5678)
 * 5. Detecção de comportamento idêntico (mesma pontuação+tempo)
 * 6. Sistema de banimento de IP (6 horas)
 * 
 * NOTA: Esta versão utiliza PostgreSQL para persistência, garantindo
 * que o estado do anti-spam não seja perdido ao reiniciar o servidor.
 */

import { pool } from "../db.js";

// ==================== INTERFACES ====================

export interface AntiSpamCheckResult {
  allowed: boolean;
  error?: string;
  statusCode?: number;
}

interface IpBan {
  ip: string;
  reason: string;
  banned_at: Date;
  expires_at: Date;
}

// ==================== CONSTANTES ====================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_SUBMISSIONS_PER_WINDOW = 3;

const COOLDOWN_MS = 30 * 1000; // 30 segundos

const PREFIX_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const MAX_PREFIX_SUBMISSIONS = 3; // Máximo 3 submissões com mesmo prefixo em 5 minutos

const BEHAVIOR_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_IDENTICAL_BEHAVIOR = 2; // Máximo 2 submissões com pontuação+tempo idênticos em 10 min

const BAN_DURATION_MS = 6 * 60 * 60 * 1000; // 6 horas

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Extrai o prefixo do nome do jogador (antes do hífen ou número)
 * Exemplo: "Guardian-1234" -> "guardian"
 */
function extractNamePrefix(apelido: string): string {
  return apelido.replace(/[-_]?\d+$/, '').toLowerCase().trim();
}

/**
 * Detecta se o nome segue o padrão de variação (Nome-XXXX)
 * Exemplo: "Guardian-1234", "Nome_5678"
 */
function isNameVariationPattern(apelido: string): boolean {
  return /^[a-zA-Z]+[-_]\d+$/.test(apelido);
}

/**
 * Normaliza o nome para detectar tentativas de bypass
 * Remove números, símbolos e substituições de letras
 * Exemplo: "J0ã0G4mer" -> "joaogamer"
 */
function normalizeNameForPattern(apelido: string): string {
  return apelido
    .toLowerCase()
    .replace(/[0-9@\$\*\!\?]/g, '') // Remove números e símbolos
    .replace(/[4áàâã]/g, 'a')
    .replace(/[3éê]/g, 'e')
    .replace(/[1í]/g, 'i')
    .replace(/[0óôõ]/g, 'o')
    .replace(/[ú]/g, 'u')
    .replace(/[\s\-_]/g, '') // Remove espaços, hífens e underscores
    .trim();
}

/**
 * Verifica se um IP está banido e retorna informações sobre o banimento
 */
async function isIpBanned(ip: string): Promise<{ banned: boolean; reason?: string; timeLeft?: number }> {
  try {
    const result = await pool.query(
      'SELECT reason, banned_at, expires_at FROM anti_spam_bans WHERE ip = $1 AND expires_at > NOW()',
      [ip]
    );

    if (result.rows.length === 0) {
      return { banned: false };
    }

    const ban = result.rows[0];
    const expiresAt = new Date(ban.expires_at).getTime();
    const now = Date.now();
    const timeLeft = Math.ceil((expiresAt - now) / 1000 / 60); // minutos

    return { 
      banned: true, 
      reason: ban.reason, 
      timeLeft 
    };
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao verificar banimento:', error);
    // Em caso de erro no banco, permitir (fail-open) para não bloquear usuários legítimos
    return { banned: false };
  }
}

/**
 * Bane um IP por comportamento suspeito
 */
async function banIp(ip: string, reason: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + BAN_DURATION_MS);
    
    await pool.query(
      `INSERT INTO anti_spam_bans (ip, reason, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (ip) 
       DO UPDATE SET reason = $2, banned_at = CURRENT_TIMESTAMP, expires_at = $3`,
      [ip, reason, expiresAt]
    );

    console.log(`[ANTI-SPAM] IP ${ip} banido por 6 horas. Razão: ${reason}`);
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao banir IP:', error);
  }
}

/**
 * Registra um evento de submissão no banco de dados
 */
async function recordSubmissionEvent(
  ip: string, 
  apelido: string, 
  pontuacao: number, 
  tempo_segundos: number
): Promise<void> {
  try {
    await pool.query(
      'INSERT INTO anti_spam_events (ip, apelido, pontuacao, tempo_segundos) VALUES ($1, $2, $3, $4)',
      [ip, apelido, pontuacao, tempo_segundos]
    );
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao registrar evento:', error);
  }
}

/**
 * Atualiza o cooldown de um IP
 */
async function updateCooldown(ip: string): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO anti_spam_cooldowns (ip, last_submission_at) 
       VALUES ($1, CURRENT_TIMESTAMP) 
       ON CONFLICT (ip) 
       DO UPDATE SET last_submission_at = CURRENT_TIMESTAMP`,
      [ip]
    );
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao atualizar cooldown:', error);
  }
}

// ==================== FUNÇÃO PRINCIPAL (Middleware) ====================

/**
 * Verifica se uma submissão de pontuação deve ser permitida
 * Aplica todas as camadas de proteção anti-spam
 * 
 * @param clientIp - Endereço IP do cliente
 * @param apelido - Nome/apelido do jogador
 * @param pontuacao - Pontuação obtida
 * @param tempo_segundos - Tempo de conclusão em segundos
 * @returns Resultado da verificação (permitido ou bloqueado com motivo)
 */
export async function checkAntiSpam(
  clientIp: string,
  apelido: string,
  pontuacao: number,
  tempo_segundos: number
): Promise<AntiSpamCheckResult> {
  try {
    // ==================== 1. VERIFICAR SE IP ESTÁ BANIDO ====================
    const banStatus = await isIpBanned(clientIp);
    if (banStatus.banned) {
      return {
        allowed: false,
        error: `IP banido por ${banStatus.reason}. Tempo restante: ${banStatus.timeLeft} minutos`,
        statusCode: 403
      };
    }

    // ==================== 2. RATE LIMITING ====================
    const rateLimitResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM anti_spam_events 
       WHERE ip = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
      [clientIp]
    );

    const submissionsInWindow = parseInt(rateLimitResult.rows[0].count);

    if (submissionsInWindow >= MAX_SUBMISSIONS_PER_WINDOW) {
      return {
        allowed: false,
        error: `Limite de ${MAX_SUBMISSIONS_PER_WINDOW} submissões por minuto atingido. Aguarde antes de tentar novamente.`,
        statusCode: 429
      };
    }

    // ==================== 3. COOLDOWN ====================
    const cooldownResult = await pool.query(
      'SELECT last_submission_at FROM anti_spam_cooldowns WHERE ip = $1',
      [clientIp]
    );

    if (cooldownResult.rows.length > 0) {
      const lastSubmission = new Date(cooldownResult.rows[0].last_submission_at).getTime();
      const now = Date.now();
      const timeSinceLastSubmission = now - lastSubmission;

      if (timeSinceLastSubmission < COOLDOWN_MS) {
        const waitTime = Math.ceil((COOLDOWN_MS - timeSinceLastSubmission) / 1000);
        return {
          allowed: false,
          error: `Aguarde ${waitTime} segundos antes de enviar outra pontuação.`,
          statusCode: 429
        };
      }
    }

    // ==================== 4. DETECÇÃO DE COMPORTAMENTO IDÊNTICO ====================
    const behaviorResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM anti_spam_events 
       WHERE ip = $1 
         AND pontuacao = $2 
         AND ABS(tempo_segundos - $3) < 1 
         AND created_at > NOW() - INTERVAL '10 minutes'`,
      [clientIp, pontuacao, tempo_segundos]
    );

    const identicalBehaviorCount = parseInt(behaviorResult.rows[0].count);

    if (identicalBehaviorCount >= MAX_IDENTICAL_BEHAVIOR) {
      await banIp(clientIp, "Comportamento idêntico detectado (mesma pontuação e tempo múltiplas vezes)");
      return {
        allowed: false,
        error: "Comportamento suspeito detectado. IP banido temporariamente.",
        statusCode: 403
      };
    }

    // ==================== 5. DETECÇÃO DE VARIAÇÃO DE NOME ====================
    const prefix = extractNamePrefix(apelido);

    const prefixResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM anti_spam_events 
       WHERE ip = $1 
         AND created_at > NOW() - INTERVAL '5 minutes'`,
      [clientIp]
    );

    // Buscar todas as submissões recentes para verificar prefixo
    const recentSubmissionsResult = await pool.query(
      `SELECT apelido 
       FROM anti_spam_events 
       WHERE ip = $1 
         AND created_at > NOW() - INTERVAL '5 minutes'`,
      [clientIp]
    );

    const samePrefixCount = recentSubmissionsResult.rows.filter(
      row => extractNamePrefix(row.apelido) === prefix
    ).length;

    if (samePrefixCount >= MAX_PREFIX_SUBMISSIONS) {
      return {
        allowed: false,
        error: `Muitas submissões com nomes similares ("${prefix}-XXX"). Aguarde 5 minutos.`,
        statusCode: 429
      };
    }

    // ==================== 6. REGISTRAR SUBMISSÃO ====================
    await recordSubmissionEvent(clientIp, apelido, pontuacao, tempo_segundos);
    await updateCooldown(clientIp);

    // Submissão permitida
    return { allowed: true };

  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao verificar anti-spam:', error);
    // Em caso de erro crítico, permitir (fail-open) para não bloquear usuários legítimos
    return { allowed: true };
  }
}

// ==================== FUNÇÕES DE GESTÃO (para uso administrativo) ====================

/**
 * Retorna a lista de IPs banidos (para painel admin)
 */
export async function getBannedIps(): Promise<IpBan[]> {
  try {
    const result = await pool.query(
      'SELECT ip, reason, banned_at, expires_at FROM anti_spam_bans WHERE expires_at > NOW() ORDER BY banned_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao buscar IPs banidos:', error);
    return [];
  }
}

/**
 * Remove o banimento de um IP (para painel admin)
 */
export async function clearBan(ip: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM anti_spam_bans WHERE ip = $1',
      [ip]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao remover banimento:', error);
    return false;
  }
}

/**
 * Limpa todos os dados de anti-spam (útil para testes)
 */
export async function clearAllAntiSpamData(): Promise<void> {
  try {
    await pool.query('DELETE FROM anti_spam_events');
    await pool.query('DELETE FROM anti_spam_bans');
    await pool.query('DELETE FROM anti_spam_cooldowns');
    console.log("[ANTI-SPAM] Todos os dados foram limpos.");
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao limpar dados:', error);
  }
}

/**
 * Limpa eventos antigos (mais de 24 horas) para manter o banco leve
 * Esta função pode ser chamada periodicamente (ex: via cron job)
 */
export async function cleanupOldEvents(): Promise<void> {
  try {
    const result = await pool.query(
      'DELETE FROM anti_spam_events WHERE created_at < NOW() - INTERVAL \'24 hours\''
    );
    console.log(`[ANTI-SPAM] ${result.rowCount} eventos antigos removidos.`);
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao limpar eventos antigos:', error);
  }
}

/**
 * Limpa banimentos expirados
 * Esta função pode ser chamada periodicamente (ex: via cron job)
 */
export async function cleanupExpiredBans(): Promise<void> {
  try {
    const result = await pool.query(
      'DELETE FROM anti_spam_bans WHERE expires_at < NOW()'
    );
    console.log(`[ANTI-SPAM] ${result.rowCount} banimentos expirados removidos.`);
  } catch (error) {
    console.error('[ANTI-SPAM] Erro ao limpar banimentos expirados:', error);
  }
}
