/**
 * Schemas de Validação com Zod
 * 
 * Este arquivo centraliza todos os schemas de validação de dados
 * da API, garantindo consistência e mensagens de erro claras.
 */

import { z } from "zod";

// ==================== SCHEMAS DE PONTUAÇÃO ====================

/**
 * Schema para validação de submissão de pontuação
 */
export const ScoreSubmissionSchema = z.object({
  apelido: z
    .string()
    .min(1, "O apelido deve ter pelo menos 1 caractere")
    .max(20, "O apelido deve ter no máximo 20 caracteres")
    .trim(),
  
  pontuacao: z
    .number()
    .int("A pontuação deve ser um número inteiro")
    .min(0, "A pontuação mínima é 0")
    .max(60, "A pontuação máxima é 60"),
  
  tempo_segundos: z
    .number()
    .min(45, "O tempo mínimo é 45 segundos")
    .max(3600, "O tempo máximo é 3600 segundos (1 hora)"),
  
  quiz_token: z
    .string()
    .min(1, "Token de sessão obrigatório")
});

/**
 * Tipo TypeScript inferido do schema
 */
export type ScoreSubmission = z.infer<typeof ScoreSubmissionSchema>;

// ==================== SCHEMAS DE CHAT ====================

/**
 * Schema para validação de mensagem de chat
 */
export const ChatMessageSchema = z.object({
  apelido: z
    .string()
    .min(1, "O apelido deve ter pelo menos 1 caractere")
    .max(20, "O apelido deve ter no máximo 20 caracteres")
    .trim(),
  
  mensagem: z
    .string()
    .min(1, "A mensagem não pode estar vazia")
    .max(500, "A mensagem deve ter no máximo 500 caracteres")
    .trim(),
  
  cor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor inválida (deve ser hexadecimal)")
    .optional()
    .default("#FF6B6B"),
  
  emoji_avatar: z
    .string()
    .optional()
    .default("😀"),
  
  tipo: z
    .string()
    .optional()
    .default("text"),
  
  gif_url: z
    .string()
    .url("URL do GIF inválida")
    .optional()
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ==================== SCHEMAS DE ADMIN ====================

/**
 * Schema para validação de senha de admin
 */
export const AdminPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Senha obrigatória")
});

export type AdminPassword = z.infer<typeof AdminPasswordSchema>;

/**
 * Schema para validação de ID
 */
export const IdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID deve ser um número")
    .transform(Number)
});

export type IdParam = z.infer<typeof IdParamSchema>;

// ==================== SCHEMAS DE SUGESTÕES ====================

/**
 * Schema para validação de sugestão
 */
export const SuggestionSchema = z.object({
  apelido: z
    .string()
    .min(1, "O apelido deve ter pelo menos 1 caractere")
    .max(20, "O apelido deve ter no máximo 20 caracteres")
    .trim(),
  
  mensagem: z
    .string()
    .min(10, "A sugestão deve ter pelo menos 10 caracteres")
    .max(1000, "A sugestão deve ter no máximo 1000 caracteres")
    .trim()
});

export type Suggestion = z.infer<typeof SuggestionSchema>;
