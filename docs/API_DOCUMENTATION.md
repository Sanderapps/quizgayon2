# Documentação da API - QuizGayon2

## Visão Geral

Esta API fornece endpoints para gerenciar o placar de líderes do QuizGayon, permitindo salvar pontuações, buscar rankings e visualizar estatísticas.

## Base URL

```
http://localhost:3000/api
```

No Railway, a URL será: `https://seu-projeto.railway.app/api`

---

## Endpoints

### 1. Salvar Pontuação

Salva uma nova pontuação no banco de dados.

**Endpoint:** `POST /api/scores`

**Body (JSON):**
```json
{
  "apelido": "JoãoGamer",
  "pontuacao": 850,
  "tempo_segundos": 45.5
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "score": {
    "id": 1,
    "apelido": "JoãoGamer",
    "pontuacao": 850,
    "tempo_segundos": 45.5,
    "data_registro": "2025-11-09T15:30:00.000Z"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "error": "Campos obrigatórios: apelido, pontuacao, tempo_segundos"
}
```

---

### 2. Buscar Placar de Líderes

Retorna o ranking dos melhores jogadores, ordenado por pontuação (maior primeiro) e tempo (menor primeiro para desempate).

**Endpoint:** `GET /api/leaderboard`

**Query Parameters:**
- `limit` (opcional): Número máximo de resultados (padrão: 100)

**Exemplo:**
```
GET /api/leaderboard?limit=10
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "id": 1,
      "apelido": "JoãoGamer",
      "pontuacao": 950,
      "tempo_segundos": 40.2,
      "data_registro": "2025-11-09T15:30:00.000Z"
    },
    {
      "id": 2,
      "apelido": "MariaQuiz",
      "pontuacao": 950,
      "tempo_segundos": 42.8,
      "data_registro": "2025-11-09T16:00:00.000Z"
    },
    {
      "id": 3,
      "apelido": "PedroFast",
      "pontuacao": 900,
      "tempo_segundos": 38.5,
      "data_registro": "2025-11-09T14:20:00.000Z"
    }
  ],
  "total": 3
}
```

---

### 3. Buscar Estatísticas

Retorna estatísticas gerais sobre todas as pontuações.

**Endpoint:** `GET /api/stats`

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "stats": {
    "total_jogadores": 150,
    "pontuacao_maxima": 1000,
    "pontuacao_media": "785.50",
    "tempo_minimo": 35.2
  }
}
```

---

### 4. Deletar Pontuação (Administração)

Remove uma pontuação específica do banco de dados.

**Endpoint:** `DELETE /api/scores/:id`

**Exemplo:**
```
DELETE /api/scores/5
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "deleted": {
    "id": 5,
    "apelido": "Trapaceiro",
    "pontuacao": 9999,
    "tempo_segundos": 1.0,
    "data_registro": "2025-11-09T12:00:00.000Z"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "error": "Pontuação não encontrada"
}
```

---

## Estrutura do Banco de Dados

### Tabela: `scores`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PRIMARY KEY) | Identificador único da pontuação |
| `apelido` | TEXT | Nome ou apelido do jogador |
| `pontuacao` | INTEGER | Pontuação obtida no quiz |
| `tempo_segundos` | REAL | Tempo em segundos para completar o quiz |
| `data_registro` | TIMESTAMP | Data e hora do registro (automático) |

### Índice

```sql
CREATE INDEX idx_scores_ranking 
ON scores (pontuacao DESC, tempo_segundos ASC);
```

Este índice otimiza as consultas de ranking, garantindo performance mesmo com milhares de registros.

---

## Lógica de Ordenação

O placar de líderes segue esta lógica:

1. **Pontuação maior vence** (ORDER BY pontuacao DESC)
2. **Em caso de empate, tempo menor vence** (ORDER BY tempo_segundos ASC)

**Exemplo:**
- Jogador A: 950 pontos em 40 segundos → **1º lugar**
- Jogador B: 950 pontos em 42 segundos → **2º lugar**
- Jogador C: 900 pontos em 30 segundos → **3º lugar**

---

## Variáveis de Ambiente (Railway)

O Railway injeta automaticamente estas variáveis:

- `DATABASE_URL` - URL completa de conexão com PostgreSQL
- `PGHOST` - Host do banco de dados
- `PGPORT` - Porta do banco de dados
- `PGUSER` - Usuário do banco de dados
- `PGPASSWORD` - Senha do banco de dados
- `PGDATABASE` - Nome do banco de dados

O código usa `DATABASE_URL` para conectar automaticamente.

---

## Como Testar Localmente

### 1. Configurar variável de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/quizgayon
NODE_ENV=development
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Iniciar servidor

```bash
pnpm run dev
```

### 4. Testar endpoints com curl

**Salvar pontuação:**
```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"apelido":"TestUser","pontuacao":800,"tempo_segundos":50.5}'
```

**Buscar placar:**
```bash
curl http://localhost:3000/api/leaderboard?limit=10
```

**Buscar estatísticas:**
```bash
curl http://localhost:3000/api/stats
```

---

## Integração com Frontend

### Exemplo em JavaScript/TypeScript

```typescript
// Salvar pontuação ao final do quiz
async function salvarPontuacao(apelido: string, pontuacao: number, tempoSegundos: number) {
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apelido,
        pontuacao,
        tempo_segundos: tempoSegundos,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Pontuação salva:', data.score);
      return data.score;
    } else {
      console.error('Erro:', data.error);
    }
  } catch (error) {
    console.error('Erro ao salvar pontuação:', error);
  }
}

// Buscar placar de líderes
async function buscarPlacar(limit = 10) {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Placar:', data.leaderboard);
      return data.leaderboard;
    }
  } catch (error) {
    console.error('Erro ao buscar placar:', error);
  }
}

// Exemplo de uso
await salvarPontuacao('JoãoGamer', 850, 45.5);
const placar = await buscarPlacar(10);
```

---

## Segurança e Boas Práticas

### Implementadas:

✅ Validação de campos obrigatórios  
✅ Uso de prepared statements (proteção contra SQL injection)  
✅ SSL habilitado em produção  
✅ Índices para performance  

### Recomendações futuras:

- [ ] Rate limiting para prevenir spam
- [ ] Autenticação para endpoint DELETE
- [ ] Validação de tamanho máximo do apelido
- [ ] Sanitização de entrada para prevenir XSS
- [ ] Logs estruturados para monitoramento

---

## Troubleshooting

### Erro: "Cannot connect to database"

**Solução:** Verifique se a variável `DATABASE_URL` está configurada corretamente no Railway.

### Erro: "Table scores does not exist"

**Solução:** A tabela é criada automaticamente na primeira execução. Verifique os logs do servidor.

### Erro: "SSL connection required"

**Solução:** O código já trata isso automaticamente em produção. Em desenvolvimento local, desabilite SSL no PostgreSQL.

---

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Railway: https://docs.railway.app
- Documentação do PostgreSQL: https://www.postgresql.org/docs/
- Repositório do projeto: https://github.com/Sanderapps/quizgayon2
