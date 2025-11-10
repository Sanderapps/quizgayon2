/**
 * Sistema Anti-Spam e Anti-Fraude
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
 */

// ==================== INTERFACES ====================

interface RateLimitData {
  submissions: number[];
}

interface SubmissionPattern {
  apelido: string;
  pontuacao: number;
  timestamp: number;
}

interface PrefixSubmission {
  fullName: string;
  timestamp: number;
}

interface BehaviorPattern {
  pontuacao: number;
  tempo_segundos: number;
  timestamp: number;
  apelido: string;
}

interface IpBan {
  bannedAt: number;
  reason: string;
}

export interface AntiSpamCheckResult {
  allowed: boolean;
  error?: string;
  statusCode?: number;
}

// ==================== ESTADO (Maps em memória) ====================
// NOTA: Este estado é volátil e será perdido ao reiniciar o servidor.
// Para produção, considere migrar para Redis ou PostgreSQL.

const ipRateLimit = new Map<string, RateLimitData>();
const ipCooldown = new Map<string, number>();
const recentSubmissions = new Map<string, SubmissionPattern[]>();
const prefixSubmissions = new Map<string, PrefixSubmission[]>();
const behaviorPatterns = new Map<string, BehaviorPattern[]>();
const bannedIps = new Map<string, IpBan>();

// ==================== CONSTANTES ====================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_SUBMISSIONS_PER_WINDOW = 3;

const COOLDOWN_MS = 30 * 1000; // 30 segundos

const PATTERN_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

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
function isIpBanned(ip: string): { banned: boolean; reason?: string; timeLeft?: number } {
  const banData = bannedIps.get(ip);
  if (!banData) return { banned: false };
  
  const now = Date.now();
  const timeElapsed = now - banData.bannedAt;
  
  // Verificar se o banimento expirou
  if (timeElapsed >= BAN_DURATION_MS) {
    bannedIps.delete(ip);
    return { banned: false };
  }
  
  const timeLeft = Math.ceil((BAN_DURATION_MS - timeElapsed) / 1000 / 60); // minutos
  return { banned: true, reason: banData.reason, timeLeft };
}

/**
 * Bane um IP por comportamento suspeito
 */
function banIp(ip: string, reason: string): void {
  bannedIps.set(ip, {
    bannedAt: Date.now(),
    reason
  });
  console.log(`[ANTI-SPAM] IP ${ip} banido por 6 horas. Razão: ${reason}`);
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
export function checkAntiSpam(
  clientIp: string,
  apelido: string,
  pontuacao: number,
  tempo_segundos: number
): AntiSpamCheckResult {
  const now = Date.now();

  // ==================== 1. VERIFICAR SE IP ESTÁ BANIDO ====================
  const banStatus = isIpBanned(clientIp);
  if (banStatus.banned) {
    return {
      allowed: false,
      error: `IP banido por ${banStatus.reason}. Tempo restante: ${banStatus.timeLeft} minutos`,
      statusCode: 403
    };
  }

  // ==================== 2. RATE LIMITING ====================
  let rateLimitData = ipRateLimit.get(clientIp);
  if (!rateLimitData) {
    rateLimitData = { submissions: [] };
    ipRateLimit.set(clientIp, rateLimitData);
  }

  // Limpar submissões antigas (fora da janela de tempo)
  rateLimitData.submissions = rateLimitData.submissions.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (rateLimitData.submissions.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return {
      allowed: false,
      error: `Limite de ${MAX_SUBMISSIONS_PER_WINDOW} submissões por minuto atingido. Aguarde antes de tentar novamente.`,
      statusCode: 429
    };
  }

  // ==================== 3. COOLDOWN ====================
  const lastCooldown = ipCooldown.get(clientIp);
  if (lastCooldown && now - lastCooldown < COOLDOWN_MS) {
    const waitTime = Math.ceil((COOLDOWN_MS - (now - lastCooldown)) / 1000);
    return {
      allowed: false,
      error: `Aguarde ${waitTime} segundos antes de enviar outra pontuação.`,
      statusCode: 429
    };
  }

  // ==================== 4. DETECÇÃO DE COMPORTAMENTO IDÊNTICO ====================
  let behaviorData = behaviorPatterns.get(clientIp);
  if (!behaviorData) {
    behaviorData = [];
    behaviorPatterns.set(clientIp, behaviorData);
  }

  // Limpar padrões antigos
  behaviorData = behaviorData.filter(
    pattern => now - pattern.timestamp < BEHAVIOR_WINDOW_MS
  );
  behaviorPatterns.set(clientIp, behaviorData);

  // Verificar se há submissões idênticas (mesma pontuação E tempo)
  const identicalBehavior = behaviorData.filter(
    pattern => 
      pattern.pontuacao === pontuacao && 
      Math.abs(pattern.tempo_segundos - tempo_segundos) < 1 // Tolerância de 1 segundo
  );

  if (identicalBehavior.length >= MAX_IDENTICAL_BEHAVIOR) {
    banIp(clientIp, "Comportamento idêntico detectado (mesma pontuação e tempo múltiplas vezes)");
    return {
      allowed: false,
      error: "Comportamento suspeito detectado. IP banido temporariamente.",
      statusCode: 403
    };
  }

  // ==================== 5. DETECÇÃO DE VARIAÇÃO DE NOME ====================
  const prefix = extractNamePrefix(apelido);
  
  let prefixData = prefixSubmissions.get(clientIp);
  if (!prefixData) {
    prefixData = [];
    prefixSubmissions.set(clientIp, prefixData);
  }

  // Limpar dados antigos
  prefixData = prefixData.filter(
    sub => now - sub.timestamp < PREFIX_WINDOW_MS
  );
  prefixSubmissions.set(clientIp, prefixData);

  // Contar submissões com o mesmo prefixo
  const samePrefix = prefixData.filter(
    sub => extractNamePrefix(sub.fullName) === prefix
  );

  if (samePrefix.length >= MAX_PREFIX_SUBMISSIONS) {
    return {
      allowed: false,
      error: `Muitas submissões com nomes similares ("${prefix}-XXX"). Aguarde 5 minutos.`,
      statusCode: 429
    };
  }

  // ==================== 6. REGISTRAR SUBMISSÃO ====================
  // Registrar no rate limit
  rateLimitData.submissions.push(now);

  // Registrar no cooldown
  ipCooldown.set(clientIp, now);

  // Registrar padrão de comportamento
  behaviorData.push({
    pontuacao,
    tempo_segundos,
    timestamp: now,
    apelido
  });

  // Registrar prefixo
  prefixData.push({
    fullName: apelido,
    timestamp: now
  });

  // Submissão permitida
  return { allowed: true };
}

// ==================== FUNÇÕES DE GESTÃO (para uso administrativo) ====================

/**
 * Retorna a lista de IPs banidos (para painel admin)
 */
export function getBannedIps(): Map<string, IpBan> {
  return bannedIps;
}

/**
 * Remove o banimento de um IP (para painel admin)
 */
export function clearBan(ip: string): boolean {
  return bannedIps.delete(ip);
}

/**
 * Limpa todos os dados de anti-spam (útil para testes)
 */
export function clearAllAntiSpamData(): void {
  ipRateLimit.clear();
  ipCooldown.clear();
  recentSubmissions.clear();
  prefixSubmissions.clear();
  behaviorPatterns.clear();
  bannedIps.clear();
  console.log("[ANTI-SPAM] Todos os dados foram limpos.");
}
