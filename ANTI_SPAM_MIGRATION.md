# Migração do Sistema Anti-Spam para PostgreSQL

**Data:** 10 de novembro de 2025  
**Status:** ✅ Concluído

---

## 📋 Resumo

O sistema anti-spam foi migrado de **armazenamento em memória** (Maps do JavaScript) para **persistência em PostgreSQL**. Isso garante que o estado do anti-spam não seja perdido ao reiniciar o servidor.

---

## 🎯 Problema Resolvido

**Antes:** O sistema anti-spam utilizava estruturas de dados em memória (`Map`). Sempre que o servidor era reiniciado (deploy, crash, etc.), todos os dados eram perdidos:
- IPs banidos voltavam a ter acesso
- Rate limits eram resetados
- Histórico de comportamento suspeito era apagado

**Depois:** Todos os dados são armazenados no PostgreSQL, garantindo persistência completa.

---

## 🗄️ Estrutura do Banco de Dados

Foram criadas **3 novas tabelas**:

### 1. `anti_spam_events`
Armazena todos os eventos de submissão para análise de padrões.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | ID único do evento |
| `ip` | VARCHAR(45) | Endereço IP do cliente |
| `apelido` | VARCHAR(50) | Nome do jogador |
| `pontuacao` | INTEGER | Pontuação obtida |
| `tempo_segundos` | INTEGER | Tempo de conclusão |
| `created_at` | TIMESTAMP | Momento da submissão |

**Índices:**
- `idx_anti_spam_events_ip_created` em `(ip, created_at DESC)`
- `idx_anti_spam_events_created` em `(created_at DESC)`

---

### 2. `anti_spam_bans`
Armazena IPs banidos.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | ID único do banimento |
| `ip` | VARCHAR(45) UNIQUE | Endereço IP banido |
| `reason` | TEXT | Motivo do banimento |
| `banned_at` | TIMESTAMP | Momento do banimento |
| `expires_at` | TIMESTAMP | Momento de expiração (6h após) |

**Índices:**
- `idx_anti_spam_bans_ip_expires` em `(ip, expires_at)`
- `idx_anti_spam_bans_expires` em `(expires_at)`

---

### 3. `anti_spam_cooldowns`
Armazena cooldowns (última submissão por IP).

| Coluna | Tipo | Descrição |
|---|---|---|
| `ip` | VARCHAR(45) PRIMARY KEY | Endereço IP |
| `last_submission_at` | TIMESTAMP | Momento da última submissão válida |

---

## 📁 Arquivos Modificados

### 1. `server/db.ts`
**Mudanças:**
- Adicionadas queries de criação das 3 tabelas de anti-spam
- Adicionados índices otimizados para queries rápidas

### 2. `server/middleware/antiSpam.ts`
**Mudanças:**
- **Reescrito completamente** para usar PostgreSQL
- Todas as funções agora são `async`
- Substituídos `Map.get()` por `pool.query()`
- Mantidas todas as 6 camadas de proteção:
  1. Rate Limiting (3 submissões/minuto)
  2. Cooldown (30 segundos)
  3. Detecção de padrões suspeitos
  4. Detecção de variação de nome
  5. Detecção de comportamento idêntico
  6. Sistema de banimento (6 horas)
- Adicionadas funções de limpeza:
  - `cleanupOldEvents()`: Remove eventos com mais de 24 horas
  - `cleanupExpiredBans()`: Remove banimentos expirados

### 3. `server/index.ts`
**Mudanças:**
- Removido código antigo do anti-spam em memória (~100 linhas)
- Adicionado `await` na chamada de `checkAntiSpam()`
- Adicionada limpeza periódica automática:
  - Eventos antigos: a cada 1 hora
  - Banimentos expirados: a cada 30 minutos
- Corrigido erro de iteração em `quizTokens.entries()`

---

## ✅ Validação

O código foi validado com sucesso:
- ✅ TypeScript compila sem erros (`pnpm run check`)
- ✅ Todas as dependências instaladas
- ✅ Estrutura das tabelas criada automaticamente na inicialização

---

## 🚀 Deploy

### Passos para Deploy na Railway:

1. **Commit e Push:**
   ```bash
   git add .
   git commit -m "feat: migrar sistema anti-spam para PostgreSQL"
   git push origin main
   ```

2. **Railway irá automaticamente:**
   - Detectar as mudanças
   - Executar `pnpm install`
   - Executar `pnpm run build`
   - Reiniciar o servidor
   - Criar as novas tabelas no PostgreSQL (via `initializeDatabase()`)

3. **Verificação pós-deploy:**
   - Acessar o painel de logs da Railway
   - Confirmar a mensagem: `✅ Banco de dados inicializado com sucesso`
   - Testar uma submissão de pontuação
   - Verificar se o anti-spam está funcionando

---

## 🔧 Manutenção

### Limpeza Manual (se necessário)

Para limpar todos os dados de anti-spam (útil para testes):

```javascript
// No console do servidor ou via endpoint admin
import { clearAllAntiSpamData } from './server/middleware/antiSpam.js';
await clearAllAntiSpamData();
```

### Monitoramento

Para verificar o estado do anti-spam:

```sql
-- Ver IPs banidos ativos
SELECT * FROM anti_spam_bans WHERE expires_at > NOW();

-- Ver eventos recentes (últimas 24h)
SELECT ip, COUNT(*) as submissoes 
FROM anti_spam_events 
WHERE created_at > NOW() - INTERVAL '24 hours' 
GROUP BY ip 
ORDER BY submissoes DESC;

-- Ver tamanho das tabelas
SELECT 
  'anti_spam_events' as tabela, COUNT(*) as registros FROM anti_spam_events
UNION ALL
SELECT 
  'anti_spam_bans', COUNT(*) FROM anti_spam_bans
UNION ALL
SELECT 
  'anti_spam_cooldowns', COUNT(*) FROM anti_spam_cooldowns;
```

---

## 📊 Performance

### Antes (Memória)
- ✅ Velocidade: Muito rápido (acesso O(1))
- ❌ Persistência: Nenhuma
- ❌ Escalabilidade: Limitada a uma instância

### Depois (PostgreSQL)
- ✅ Velocidade: Rápido (queries otimizadas com índices)
- ✅ Persistência: Total
- ✅ Escalabilidade: Suporta múltiplas instâncias compartilhando o mesmo estado

**Impacto estimado:** ~10-20ms de latência adicional por submissão (imperceptível para o usuário).

---

## 🔮 Melhorias Futuras (Opcional)

Se o tráfego crescer muito, considere:

1. **Cache Híbrido:** Manter um cache em memória com TTL curto (30s) para reduzir queries ao banco
2. **Redis:** Migrar para Redis se precisar de performance extrema
3. **Particionamento:** Particionar a tabela `anti_spam_events` por data se o volume crescer muito

---

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs do servidor na Railway
2. Conexão com o PostgreSQL (`DATABASE_URL` configurada?)
3. Tabelas criadas corretamente (rodar `initializeDatabase()` manualmente se necessário)

---

**Implementado por:** Manus AI  
**Revisão:** Pendente
