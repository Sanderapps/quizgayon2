/**
 * Configuração do Sistema Anti-Spam
 * 
 * Este arquivo centraliza todas as constantes configuráveis do sistema anti-spam.
 * Os valores podem ser ajustados via painel admin.
 */

export interface AntiSpamConfig {
  // Rate Limiting
  rateLimitWindowMs: number;
  maxSubmissionsPerWindow: number;
  
  // Cooldown
  cooldownMs: number;
  
  // Detecção de Prefixo
  prefixWindowMs: number;
  maxPrefixSubmissions: number;
  
  // Detecção de Comportamento Idêntico
  behaviorWindowMs: number;
  maxIdenticalBehavior: number;
  
  // Banimento
  banDurationMs: number;
}

// Configuração padrão
export const defaultAntiSpamConfig: AntiSpamConfig = {
  rateLimitWindowMs: 60 * 1000, // 1 minuto
  maxSubmissionsPerWindow: 3,
  
  cooldownMs: 30 * 1000, // 30 segundos
  
  prefixWindowMs: 5 * 60 * 1000, // 5 minutos
  maxPrefixSubmissions: 3,
  
  behaviorWindowMs: 10 * 60 * 1000, // 10 minutos
  maxIdenticalBehavior: 2,
  
  banDurationMs: 6 * 60 * 60 * 1000, // 6 horas
};

// Configuração atual (pode ser modificada em runtime)
let currentConfig: AntiSpamConfig = { ...defaultAntiSpamConfig };

export function getAntiSpamConfig(): AntiSpamConfig {
  return { ...currentConfig };
}

export function updateAntiSpamConfig(newConfig: Partial<AntiSpamConfig>): AntiSpamConfig {
  currentConfig = { ...currentConfig, ...newConfig };
  return { ...currentConfig };
}

export function resetAntiSpamConfig(): AntiSpamConfig {
  currentConfig = { ...defaultAntiSpamConfig };
  return { ...currentConfig };
}
