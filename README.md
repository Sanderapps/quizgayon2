# QuizGayon2 🌈

Quiz interativo "Descubra se você é gay" com placar de líderes global usando PostgreSQL.

## 🚀 Novidades da Versão 2.0

✅ **Placar de Líderes Global** - Sistema de ranking persistente com PostgreSQL  
✅ **API REST Completa** - Endpoints para salvar e buscar pontuações  
✅ **Ordenação Inteligente** - Ranking por pontuação e tempo de conclusão  
✅ **Estatísticas em Tempo Real** - Visualize dados agregados de todos os jogadores  
✅ **Deploy Automático no Railway** - Infraestrutura pronta para produção  

---

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Deploy no Railway](#deploy-no-railway)
- [API](#api)
- [Testes](#testes)
- [Documentação](#documentação)

---

## 🛠 Tecnologias

### Frontend
- **React** 18.3 com TypeScript
- **Vite** 7.1 - Build tool ultrarrápido
- **Tailwind CSS** 4.1 - Estilização
- **Radix UI** - Componentes acessíveis
- **Wouter** - Roteamento leve

### Backend
- **Node.js** com Express
- **PostgreSQL** - Banco de dados relacional
- **pg** - Cliente PostgreSQL para Node.js
- **TypeScript** - Tipagem estática

### DevOps
- **Railway** - Hospedagem e banco de dados
- **pnpm** - Gerenciador de pacotes
- **esbuild** - Compilador rápido

---

## 📁 Estrutura do Projeto

```
quizgayon2/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes UI
│   │   ├── pages/            # Páginas (Home, NotFound)
│   │   ├── services/         # Serviços de API
│   │   │   └── api.ts        # Cliente da API REST
│   │   └── hooks/            # React hooks customizados
│   └── ...
├── server/                    # Backend Node.js
│   ├── index.ts              # Servidor Express + rotas API
│   └── db.ts                 # Configuração PostgreSQL
├── shared/                    # Código compartilhado
│   └── const.ts              # Constantes
├── .env.example              # Exemplo de variáveis de ambiente
├── railway.json              # Configuração do Railway
├── package.json              # Dependências do projeto
├── API_DOCUMENTATION.md      # Documentação completa da API
├── FRONTEND_INTEGRATION.md   # Guia de integração frontend
└── test-api.sh               # Script de testes da API
```

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 22+ (recomendado)
- **pnpm** 10+ (ou npm/yarn)
- **PostgreSQL** 14+ (local ou Railway)

### Clonar Repositório

```bash
git clone https://github.com/Sanderapps/quizgayon2.git
cd quizgayon2
```

### Instalar Dependências

```bash
pnpm install
```

---

## 💻 Desenvolvimento Local

### 1. Configurar Banco de Dados

#### Opção A: PostgreSQL Local

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb quizgayon

# Obter URL de conexão
echo "postgresql://postgres:sua_senha@localhost:5432/quizgayon"
```

#### Opção B: Docker

```bash
docker run --name postgres-quiz \
  -e POSTGRES_PASSWORD=senha \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env
nano .env
```

Conteúdo do `.env`:

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/quizgayon
NODE_ENV=development
PORT=3000
```

### 3. Iniciar Servidor de Desenvolvimento

```bash
pnpm run dev
```

O servidor estará disponível em: **http://localhost:3000**

### 4. Verificar Inicialização do Banco

O banco de dados é inicializado automaticamente na primeira execução. Você verá:

```
✅ Banco de dados inicializado com sucesso
🚀 Server running on http://localhost:3000/
📊 API disponível em /api/scores e /api/leaderboard
```

---

## 🚂 Deploy no Railway

### 1. Criar Conta no Railway

Acesse [railway.app](https://railway.app) e crie uma conta.

### 2. Criar Novo Projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório `quizgayon2`

### 3. Adicionar Banco de Dados PostgreSQL

1. No dashboard do projeto, clique em **"New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. O Railway criará automaticamente as variáveis de ambiente

### 4. Conectar Serviços

1. Clique no serviço **web** (teia)
2. Vá em **"Variables"**
3. Clique em **"Reference Variable"**
4. Selecione o serviço **Postgres**
5. Adicione `DATABASE_URL`

### 5. Deploy Automático

O Railway detecta automaticamente o `railway.json` e faz o deploy:

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm run build"
  },
  "deploy": {
    "startCommand": "pnpm run start",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 5
  }
}
```

### 6. Obter URL Pública

Após o deploy, o Railway fornecerá uma URL pública:

```
https://quizgayon2-production.up.railway.app
```

---

## 🔌 API

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/scores` | Salvar nova pontuação |
| GET | `/api/leaderboard` | Buscar placar de líderes |
| GET | `/api/stats` | Buscar estatísticas gerais |
| DELETE | `/api/scores/:id` | Deletar pontuação (admin) |

### Exemplos de Uso

#### Salvar Pontuação

```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "apelido": "JoãoGamer",
    "pontuacao": 850,
    "tempo_segundos": 45.5
  }'
```

#### Buscar Placar

```bash
curl http://localhost:3000/api/leaderboard?limit=10
```

#### Buscar Estatísticas

```bash
curl http://localhost:3000/api/stats
```

Para documentação completa, veja [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## 🧪 Testes

### Teste Manual da API

Execute o script de testes:

```bash
./test-api.sh
```

Ou com URL customizada:

```bash
API_URL=https://seu-app.railway.app/api ./test-api.sh
```

### Teste no Navegador

1. Acesse `http://localhost:3000`
2. Complete o quiz
3. Digite um nome
4. Verifique o placar de líderes
5. Abra o **DevTools** (F12) → **Console** para ver logs

### Verificar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql $DATABASE_URL

# Ver todas as pontuações
SELECT * FROM scores ORDER BY pontuacao DESC, tempo_segundos ASC;

# Ver estatísticas
SELECT 
  COUNT(*) as total,
  MAX(pontuacao) as max,
  AVG(pontuacao)::NUMERIC(10,2) as media,
  MIN(tempo_segundos) as tempo_min
FROM scores;
```

---

## 📚 Documentação

### Documentos Disponíveis

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentação completa da API REST
- **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** - Guia de integração do frontend
- **[.env.example](./.env.example)** - Exemplo de variáveis de ambiente

### Estrutura do Banco de Dados

#### Tabela: `scores`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | ID único (chave primária) |
| `apelido` | TEXT | Nome/apelido do jogador |
| `pontuacao` | INTEGER | Pontuação obtida (0-45) |
| `tempo_segundos` | REAL | Tempo de conclusão em segundos |
| `data_registro` | TIMESTAMP | Data/hora do registro |

#### Índice de Performance

```sql
CREATE INDEX idx_scores_ranking 
ON scores (pontuacao DESC, tempo_segundos ASC);
```

---

## 🎯 Lógica de Ordenação

O placar de líderes usa a seguinte lógica:

1. **Pontuação maior vence** (ORDER BY pontuacao DESC)
2. **Em caso de empate, tempo menor vence** (ORDER BY tempo_segundos ASC)

**Exemplo:**
- 🥇 Jogador A: 950 pontos em 40 segundos
- 🥈 Jogador B: 950 pontos em 42 segundos
- 🥉 Jogador C: 900 pontos em 30 segundos

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev          # Inicia servidor de desenvolvimento

# Build
pnpm run build        # Compila frontend e backend

# Produção
pnpm run start        # Inicia servidor em produção

# Verificação
pnpm run check        # Verifica tipos TypeScript

# Formatação
pnpm run format       # Formata código com Prettier
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:** Verifique se a variável `DATABASE_URL` está configurada corretamente.

```bash
echo $DATABASE_URL
# Deve retornar: postgresql://usuario:senha@host:porta/banco
```

### Erro: "Table scores does not exist"

**Solução:** A tabela é criada automaticamente. Verifique os logs do servidor:

```bash
pnpm run dev
# Procure por: ✅ Banco de dados inicializado com sucesso
```

### Erro: "Port 3000 already in use"

**Solução:** Mate o processo ou use outra porta:

```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
PORT=3001 pnpm run dev
```

### Frontend não conecta com API

**Solução:** Verifique se o servidor está rodando e se a URL está correta:

```bash
# Testar endpoint
curl http://localhost:3000/api/leaderboard

# Verificar logs do servidor
pnpm run dev
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adicionar NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Sander** - [@Sanderapps](https://github.com/Sanderapps)

---

## 🙏 Agradecimentos

- Railway por fornecer infraestrutura gratuita
- Comunidade React e TypeScript
- Todos que contribuíram com feedback

---

## 📞 Suporte

- 🐛 **Issues:** [GitHub Issues](https://github.com/Sanderapps/quizgayon2/issues)
- 📧 **Email:** [Seu email]
- 💬 **Discord:** [Seu Discord]

---

## 🗺 Roadmap

- [x] Implementar PostgreSQL
- [x] Criar API REST
- [x] Deploy no Railway
- [ ] Adicionar autenticação OAuth
- [ ] Implementar cache com Redis
- [ ] Adicionar modo multiplayer
- [ ] Criar dashboard de administração
- [ ] Adicionar mais perguntas NSFW
- [ ] Implementar sistema de conquistas
- [ ] Adicionar compartilhamento social

---

**Feito com 💖 e 🌈**
