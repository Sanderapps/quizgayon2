# Setup Local - QuizGayOn2

Guia completo para rodar o projeto localmente.

## Pré-requisitos

- **Node.js** 18 ou superior
- **pnpm** (gerenciador de pacotes)
- **Conta no Neon** (banco de dados PostgreSQL serverless - gratuito)

## Instalação Rápida

### 1. Instalar pnpm (se ainda não tiver)

```bash
npm install -g pnpm
```

### 2. Clonar o repositório

```bash
git clone https://github.com/Sanderapps/quizgayon2.git
cd quizgayon2
```

### 3. Instalar dependências

```bash
pnpm install
```

### 4. Configurar banco de dados Neon

#### Opção A: Usar o banco já criado

O projeto já tem um banco de dados Neon configurado. O arquivo `.env` já está pronto com a connection string.

#### Opção B: Criar seu próprio banco Neon

1. Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita
2. Crie um novo projeto chamado "quizgayon2-dev"
3. Copie a connection string fornecida
4. Cole no arquivo `.env` na variável `DATABASE_URL`

### 5. Verificar arquivo .env

O arquivo `.env` na raiz do projeto deve conter:

```env
DATABASE_URL=postgresql://neondb_owner:npg_G3apC7skyqHY@ep-weathered-darkness-afe9az4c-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
ADMIN_PASSWORD=@dm1n321
NODE_ENV=development
PORT=3000
```

### 6. Rodar o projeto

```bash
pnpm dev
```

O servidor vai iniciar em: **http://localhost:3000**

## Estrutura do Projeto

- **Frontend**: React + Vite (hot reload automático)
- **Backend**: Express + TypeScript (reinicia automaticamente)
- **Banco**: PostgreSQL no Neon (serverless)

## Comandos Úteis

```bash
# Desenvolvimento (frontend + backend)
pnpm dev

# Build de produção
pnpm build

# Rodar versão de produção
pnpm start

# Limpar node_modules e reinstalar
pnpm clean
pnpm install
```

## Informações do Banco de Dados

### Projeto Neon Criado

- **Nome**: quizgayon2-dev
- **Project ID**: floral-snow-95440638
- **Branch**: main (br-twilight-band-af2imrwv)
- **Database**: neondb
- **Região**: us-west-2 (AWS)

### Tabelas do Banco

As tabelas são criadas automaticamente na primeira execução:

- `scores` - Pontuações dos usuários
- `chat_messages` - Mensagens do chat global
- `suggestions` - Sugestões dos usuários
- `changelog` - Histórico de mudanças
- `ip_bans` - IPs banidos
- `rate_limit_events` - Eventos de rate limiting

## Painel Admin

Acesse: **http://localhost:3000/admin**

Senha padrão: `@dm1n321`

Funcionalidades:
- Estatísticas em tempo real
- Gerenciamento de chat
- Gerenciamento de pontuações
- Sistema de banimentos
- Configuração anti-spam

## Troubleshooting

### Erro de conexão com o banco

1. Verifique se a `DATABASE_URL` no `.env` está correta
2. Teste a conexão diretamente:
   ```bash
   psql "postgresql://neondb_owner:npg_G3apC7skyqHY@ep-weathered-darkness-afe9az4c-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
   ```

### Porta 3000 já em uso

Mude a porta no `.env`:
```env
PORT=3001
```

### Erro ao instalar dependências

Limpe o cache e reinstale:
```bash
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Deploy em Produção

Para fazer deploy na Railway, veja: [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md)

## Adicionar Novos Quizzes

1. Crie os arquivos em `client/src/data/quizzes/`:
   - `{nome}Quiz.ts` - Configuração do quiz
   - `{nome}Questions.ts` - Perguntas e respostas

2. Adicione o quiz no `index.ts`:
   ```typescript
   import { novoQuiz } from "./novoQuiz";
   
   export const allQuizzes: Quiz[] = [
     gayQuiz,
     politicoQuiz,
     regionalQuiz,
     novoQuiz, // Adicione aqui
   ];
   ```

3. O quiz estará disponível automaticamente na home

## Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.
