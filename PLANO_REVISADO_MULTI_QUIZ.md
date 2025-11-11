# 🎯 Plano Revisado: Sistema Multi-Quiz (Alinhado à Estrutura Atual)

## 📋 Situação Atual

### ✅ Já Implementado
- Sistema de quizzes modularizado (`data/quizzes/`)
- Interfaces TypeScript completas
- Hooks `useQuiz` e `useQuizTheme`
- Context de tema
- Backend modularizado
- Coluna `quiz_id` no banco de dados

### ❌ Falta Implementar
- Rotas multi-quiz (`/quiz/:quizId`)
- Migração das perguntas do `Home.tsx` para `gayQuiz.ts`
- Preenchimento de títulos/frases/ícones
- Backend filtrar por `quiz_id`
- Lógica de seleção de quiz

---

## ⚠️ DECISÕES NECESSÁRIAS (USUÁRIO)

### 1. Quiz Regional vs Personalidade?
O plano original menciona "Regional" (Sulista vs Nordestino), mas o código já tem "Personalidade".

**Opções:**
- **A)** Substituir `personalidadeQuiz.ts` por `regionalQuiz.ts`
- **B)** Manter ambos (4 quizzes: Gay, Político, Regional, Personalidade)
- **C)** Manter só Personalidade (ignorar Regional do plano)

### 2. Página Inicial?
**Opções:**
- **A)** `/` redireciona para `/quiz/gay` (mantém comportamento atual)
- **B)** `/` vira um seletor de quizzes (página nova)

### 3. Ordem de Implementação?
**Opções:**
- **A)** Migrar quiz gay completamente primeiro, depois criar novos
- **B)** Criar estrutura de todos, depois preencher dados

---

## 🚀 PLANO DE IMPLEMENTAÇÃO REVISADO

### **FASE 0: Decisões** (5min - Usuário)
- [ ] Escolher: Regional, Personalidade ou ambos?
- [ ] Escolher: Página inicial (redirect ou seletor)?
- [ ] Escolher: Ordem de implementação (A ou B)?

---

### **FASE 1: Migração do Quiz Gay** (2h - Manus)

#### 1.1. Migrar Perguntas
- [ ] Copiar 50 perguntas do `Home.tsx` (linhas 41-602)
- [ ] Adaptar formato para interface `Question` do `types.ts`
- [ ] Adicionar em `gayQuiz.ts`

#### 1.2. Migrar Resultados (Títulos)
- [ ] Copiar títulos do `Home.tsx` (linhas 604-638)
- [ ] Separar em `categories.low` (0-49%) e `categories.high` (50-100%)
- [ ] Adicionar em `gayQuiz.ts`

#### 1.3. Adicionar Frases e Ícones
- [ ] Buscar frases do placar no `Leaderboard.tsx`
- [ ] Adicionar em `phrases` e `icons`

---

### **FASE 2: Rotas Multi-Quiz** (1h - Manus)

#### 2.1. Atualizar Rotas
```typescript
// App.tsx
<Route path="/" component={Home} />
<Route path="/quiz/:quizId" component={Home} />
```

#### 2.2. Atualizar Home.tsx
- [ ] Aceitar parâmetro `quizId` da URL
- [ ] Carregar quiz com `getQuizById(quizId)`
- [ ] Fallback para quiz "gay" se não encontrar
- [ ] Aplicar tema do quiz

#### 2.3. Atualizar useQuiz Hook
- [ ] Aceitar objeto `Quiz` completo
- [ ] Usar `quiz.questions` em vez de array externo

---

### **FASE 3: Backend Multi-Quiz** (1h - Manus)

#### 3.1. Atualizar API de Placar
```typescript
// GET /api/leaderboard?quiz_id=gay
export async function fetchLeaderboard(req: Request, res: Response) {
  const quizId = req.query.quiz_id as string || "gay";
  const leaderboard = await getLeaderboard(quizId, limit);
  // ...
}
```

#### 3.2. Atualizar API de Pontuação
```typescript
// POST /api/scores { quiz_id: "gay", ... }
export async function submitScore(req: Request, res: Response) {
  const { quiz_id = "gay", apelido, pontuacao, tempo_segundos } = req.body;
  await saveScore({ quiz_id, apelido, pontuacao, tempo_segundos });
  // ...
}
```

#### 3.3. Atualizar Frontend
- [ ] Passar `quiz_id` ao salvar pontuação
- [ ] Filtrar placar por `quiz_id`

---

### **FASE 4: Novos Quizzes** (2h - Manus + Usuário)

#### 4.1. Quiz Político (Manus - 30min)
- [ ] Preencher `politicoQuiz.ts` com dados do plano
- [ ] Adicionar títulos (Bolsonarista vs Lulista)
- [ ] Adicionar frases e ícones
- [ ] **AGUARDAR:** Usuário criar 50 perguntas

#### 4.2. Quiz Regional/Personalidade (Manus - 30min)
- [ ] Criar ou atualizar arquivo
- [ ] Adicionar títulos (Sulista vs Nordestino OU outro tema)
- [ ] Adicionar frases e ícones
- [ ] **AGUARDAR:** Usuário criar 50 perguntas

#### 4.3. Descomentar no index.ts
```typescript
export const allQuizzes: Quiz[] = [
  gayQuiz,
  politicoQuiz,  // ✅ Descomentar
  regionalQuiz,  // ✅ Descomentar
];
```

---

### **FASE 5: Página Inicial (Opcional)** (1h - Manus)

**Se escolher opção B (seletor):**
- [ ] Criar componente `QuizSelector`
- [ ] Listar todos os quizzes disponíveis
- [ ] Cards com emoji, título e descrição
- [ ] Link para `/quiz/:quizId`

---

### **FASE 6: Testes e Deploy** (30min - Manus)

#### 6.1. Testes Locais
- [ ] Testar navegação `/quiz/gay`
- [ ] Testar navegação `/quiz/politico`
- [ ] Testar placar separado por quiz
- [ ] Testar temas diferentes

#### 6.2. Deploy
- [ ] Commit e push
- [ ] Testar em produção
- [ ] Verificar placares no admin

---

## 💰 Estimativa de Tempo Revisada

| Fase | Responsável | Tempo | Dependências |
|------|-------------|-------|--------------|
| 0. Decisões | Usuário | 5min | - |
| 1. Migração Quiz Gay | Manus | 2h | Fase 0 |
| 2. Rotas Multi-Quiz | Manus | 1h | Fase 1 |
| 3. Backend Multi-Quiz | Manus | 1h | Fase 2 |
| 4. Novos Quizzes (estrutura) | Manus | 1h | Fase 3 |
| 4. Perguntas novos quizzes | **Usuário** | **2-3h** | Fase 4 (Manus) |
| 5. Página Inicial (opcional) | Manus | 1h | Fase 4 |
| 6. Testes e Deploy | Manus | 30min | Todas |
| **TOTAL (Manus)** | - | **6-7h** | - |
| **TOTAL (Usuário)** | - | **2-3h** | - |

---

## 📝 Checklist Completo

### Fase 0: Decisões
- [ ] Decidir: Regional, Personalidade ou ambos
- [ ] Decidir: Página inicial (redirect ou seletor)
- [ ] Decidir: Ordem de implementação

### Fase 1: Migração Quiz Gay
- [ ] Migrar 50 perguntas para `gayQuiz.ts`
- [ ] Migrar títulos (34 resultados)
- [ ] Adicionar frases do placar
- [ ] Adicionar ícones do placar

### Fase 2: Rotas
- [ ] Adicionar rota `/quiz/:quizId` no `App.tsx`
- [ ] Atualizar `Home.tsx` para aceitar `quizId`
- [ ] Atualizar `useQuiz` para aceitar objeto `Quiz`
- [ ] Aplicar tema dinâmico

### Fase 3: Backend
- [ ] Atualizar `GET /api/leaderboard` com filtro `quiz_id`
- [ ] Atualizar `POST /api/scores` com campo `quiz_id`
- [ ] Atualizar frontend para enviar `quiz_id`

### Fase 4: Novos Quizzes
- [ ] Preencher `politicoQuiz.ts`
- [ ] Criar/preencher `regionalQuiz.ts` ou manter `personalidadeQuiz.ts`
- [ ] Descomentar no `index.ts`
- [ ] **Usuário:** Criar perguntas

### Fase 5: Página Inicial (Opcional)
- [ ] Criar `QuizSelector` component
- [ ] Listar quizzes disponíveis
- [ ] Adicionar navegação

### Fase 6: Testes
- [ ] Testar navegação
- [ ] Testar placares
- [ ] Testar temas
- [ ] Deploy

---

## 🎯 Próximos Passos

**1. Usuário decide as 3 questões da Fase 0**
**2. Manus implementa Fases 1-3 (4h)**
**3. Usuário cria perguntas (2-3h)**
**4. Manus finaliza e faz deploy (30min)**

**Pronto para começar?** 🚀
