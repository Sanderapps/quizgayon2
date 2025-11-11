# Guia de Integração Frontend - PostgreSQL

Este guia explica como integrar o placar de líderes do PostgreSQL ao frontend do QuizGayon2.

## Arquivos Criados

### 1. `/client/src/services/api.ts`

Serviço de API com funções prontas para comunicação com o backend:

- `salvarPontuacao(apelido, pontuacao, tempoSegundos)` - Salva pontuação no banco
- `buscarPlacar(limit)` - Busca placar de líderes
- `buscarEstatisticas()` - Busca estatísticas gerais
- `deletarPontuacao(id)` - Deleta pontuação (admin)

---

## Modificações Necessárias no `Home.tsx`

### 1. Adicionar Imports

No início do arquivo `client/src/pages/Home.tsx`, adicione:

```typescript
import { salvarPontuacao, buscarPlacar, pontuacaoParaPercentual } from "@/services/api";
```

### 2. Adicionar Estado para Tempo

Adicione um estado para rastrear o tempo de início do quiz:

```typescript
const [startTime, setStartTime] = useState<number>(0);
```

### 3. Modificar Início do Quiz

Atualize a função que inicia o quiz para registrar o tempo:

```typescript
const startQuiz = () => {
  setQuizStarted(true);
  setStartTime(Date.now()); // Registra tempo de início
};
```

### 4. Modificar `saveToLeaderboard`

**ANTES (salvava no localStorage):**
```typescript
const saveToLeaderboard = (name: string) => {
  const result = getResult();
  const maxPoints = questions.length * 3;
  const percentage = Math.round((totalPoints / maxPoints) * 100);

  const entry: LeaderEntry = {
    name: name || "Anônimo",
    percentage,
    result: result.title,
    date: new Date().toLocaleDateString("pt-BR"),
  };

  const updated = [entry, ...leaderboard].slice(0, 50);
  setLeaderboard(updated);
  localStorage.setItem("gayQuizLeaderboard", JSON.stringify(updated));
  setShowNameInput(false);
  setShowResult(true);
};
```

**DEPOIS (salva no PostgreSQL):**
```typescript
const saveToLeaderboard = async (name: string) => {
  const tempoSegundos = (Date.now() - startTime) / 1000; // Calcula tempo em segundos
  const apelido = name || "Anônimo";

  // Salvar no banco de dados PostgreSQL
  const saved = await salvarPontuacao(apelido, totalPoints, tempoSegundos);

  if (saved) {
    console.log("✅ Pontuação salva no banco de dados:", saved);
    
    // Atualizar placar local
    await loadLeaderboard();
  } else {
    console.error("❌ Erro ao salvar pontuação");
    // Fallback: salvar no localStorage como backup
    const result = getResult();
    const maxPoints = questions.length * 3;
    const percentage = Math.round((totalPoints / maxPoints) * 100);
    
    const entry: LeaderEntry = {
      name: apelido,
      percentage,
      result: result.title,
      date: new Date().toLocaleDateString("pt-BR"),
    };
    
    const updated = [entry, ...leaderboard].slice(0, 50);
    setLeaderboard(updated);
    localStorage.setItem("gayQuizLeaderboard", JSON.stringify(updated));
  }

  setShowNameInput(false);
  setShowResult(true);
};
```

### 5. Adicionar Função para Carregar Placar

Adicione uma nova função para buscar o placar do banco:

```typescript
const loadLeaderboard = async () => {
  const placar = await buscarPlacar(50); // Top 50
  
  // Converter formato do banco para formato do frontend
  const entries: LeaderEntry[] = placar.map(score => {
    const percentage = pontuacaoParaPercentual(score.pontuacao, questions.length || 15);
    return {
      name: score.apelido,
      percentage,
      result: getResultByPercentage(percentage).title,
      date: new Date(score.data_registro).toLocaleDateString("pt-BR"),
    };
  });
  
  setLeaderboard(entries);
};
```

### 6. Adicionar Função Auxiliar

Adicione uma função para obter o resultado baseado na porcentagem:

```typescript
const getResultByPercentage = (percentage: number): Result => {
  let result = RESULTS[0];
  for (let i = RESULTS.length - 1; i >= 0; i--) {
    if (percentage >= RESULTS[i].percentage) {
      result = RESULTS[i];
      break;
    }
  }
  return result;
};
```

### 7. Modificar useEffect do Leaderboard

**ANTES:**
```typescript
useEffect(() => {
  const saved = localStorage.getItem("gayQuizLeaderboard");
  if (saved) {
    setLeaderboard(JSON.parse(saved));
  }
}, []);
```

**DEPOIS:**
```typescript
useEffect(() => {
  // Carregar placar do banco de dados
  loadLeaderboard();
  
  // Fallback: carregar do localStorage se o banco falhar
  const saved = localStorage.getItem("gayQuizLeaderboard");
  if (saved && leaderboard.length === 0) {
    setLeaderboard(JSON.parse(saved));
  }
}, []);
```

### 8. Atualizar Botão de Iniciar Quiz

Certifique-se de que o botão de iniciar chama a função `startQuiz`:

```typescript
<Button onClick={startQuiz} size="lg">
  Começar o Teste 🌈
</Button>
```

---

## Exemplo Completo de Integração

Aqui está um exemplo de como ficaria a seção modificada:

```typescript
export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [nsfw, setNsfw] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [startTime, setStartTime] = useState<number>(0); // NOVO

  // Carregar leaderboard do banco de dados
  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const placar = await buscarPlacar(50);
    
    const entries: LeaderEntry[] = placar.map(score => {
      const percentage = pontuacaoParaPercentual(score.pontuacao, 15);
      return {
        name: score.apelido,
        percentage,
        result: getResultByPercentage(percentage).title,
        date: new Date(score.data_registro).toLocaleDateString("pt-BR"),
      };
    });
    
    setLeaderboard(entries);
  };

  const getResultByPercentage = (percentage: number): Result => {
    let result = RESULTS[0];
    for (let i = RESULTS.length - 1; i >= 0; i--) {
      if (percentage >= RESULTS[i].percentage) {
        result = RESULTS[i];
        break;
      }
    }
    return result;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
  };

  const saveToLeaderboard = async (name: string) => {
    const tempoSegundos = (Date.now() - startTime) / 1000;
    const apelido = name || "Anônimo";

    const saved = await salvarPontuacao(apelido, totalPoints, tempoSegundos);

    if (saved) {
      console.log("✅ Pontuação salva:", saved);
      await loadLeaderboard();
    } else {
      console.error("❌ Erro ao salvar pontuação");
    }

    setShowNameInput(false);
    setShowResult(true);
  };

  // ... resto do código
}
```

---

## Testando a Integração

### 1. Desenvolvimento Local

```bash
# Terminal 1: Iniciar banco de dados PostgreSQL local
docker run --name postgres-quiz -e POSTGRES_PASSWORD=senha -p 5432:5432 -d postgres

# Terminal 2: Configurar variável de ambiente
export DATABASE_URL="postgresql://postgres:senha@localhost:5432/postgres"

# Terminal 3: Iniciar servidor
pnpm run dev
```

### 2. Testar Fluxo Completo

1. Acesse `http://localhost:3000`
2. Complete o quiz
3. Digite um nome
4. Verifique se a pontuação aparece no placar
5. Abra o console do navegador para ver logs

### 3. Verificar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql $DATABASE_URL

# Ver todas as pontuações
SELECT * FROM scores ORDER BY pontuacao DESC, tempo_segundos ASC;

# Ver estatísticas
SELECT COUNT(*) as total, MAX(pontuacao) as max, AVG(pontuacao) as media FROM scores;
```

---

## Migração de Dados Antigos

Se você já tem dados no localStorage, pode migrá-los:

```typescript
// Função de migração (executar uma vez)
const migrateLocalStorageToDatabase = async () => {
  const saved = localStorage.getItem("gayQuizLeaderboard");
  if (!saved) return;

  const oldLeaderboard: LeaderEntry[] = JSON.parse(saved);

  for (const entry of oldLeaderboard) {
    const pontuacao = percentualParaPontuacao(entry.percentage, 15);
    const tempoEstimado = 60; // Tempo estimado padrão
    
    await salvarPontuacao(entry.name, pontuacao, tempoEstimado);
  }

  console.log("✅ Migração concluída!");
};
```

---

## Troubleshooting

### Erro: "Failed to fetch"

**Causa:** O backend não está rodando ou a URL está incorreta.

**Solução:** 
- Verifique se o servidor está rodando em `http://localhost:3000`
- Verifique se a variável `DATABASE_URL` está configurada

### Placar não atualiza

**Causa:** O frontend não está chamando `loadLeaderboard()` após salvar.

**Solução:** Certifique-se de chamar `await loadLeaderboard()` após `salvarPontuacao()`.

### Tempo sempre 0

**Causa:** `startTime` não foi inicializado.

**Solução:** Certifique-se de chamar `setStartTime(Date.now())` ao iniciar o quiz.

---

## Próximos Passos

1. ✅ Implementar backend PostgreSQL
2. ✅ Criar serviço de API no frontend
3. ⏳ Modificar `Home.tsx` com as mudanças acima
4. ⏳ Testar localmente
5. ⏳ Deploy no Railway
6. ⏳ Testar em produção

---

## Recursos Adicionais

- [Documentação da API](./API_DOCUMENTATION.md)
- [Fetch API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Hooks - useState](https://react.dev/reference/react/useState)
- [React Hooks - useEffect](https://react.dev/reference/react/useEffect)
