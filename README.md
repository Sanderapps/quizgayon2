# QuiZoeira

Aplicação full-stack de quiz com ranking global, chat em tempo real, rádio integrada e painel administrativo, deployada na Railway.

## Estado atual

- Frontend em `React + Vite + TypeScript`
- Backend em `Express + Socket.IO`
- Persistência em `PostgreSQL`
- Deploy em `Railway`
- Typecheck e build passando com `pnpm check` e `pnpm build`

## O que o projeto faz

- Seleção de quizzes com temas diferentes
- Execução de 15 perguntas aleatórias a partir de pools maiores
- Salvamento de pontuação com ranking por pontuação e tempo
- Chat em tempo real com persistência
- Rádio com streaming, painel admin e retomada automática com fallback quando autoplay é bloqueado
- Painel administrativo protegido por senha
- Sistema anti-spam para submissão de score

## Quizzes

Hoje o projeto expõe estes quizzes:

- `gay`
- `politico`
- `regional`

Os dados ficam em [client/src/data/quizzes](/root/qz/quizgayon2/client/src/data/quizzes).

## Arquitetura

```text
client/   -> app React
server/   -> API Express, Socket.IO, regras de negócio
api/      -> entrada alternativa para runtime compatível com função
patches/  -> patch local de dependência
```

Pontos principais:

- bootstrap do servidor: [server/index.ts](/root/qz/quizgayon2/server/index.ts)
- inicialização do banco: [server/db.ts](/root/qz/quizgayon2/server/db.ts)
- autenticação admin: [server/auth/adminAuth.ts](/root/qz/quizgayon2/server/auth/adminAuth.ts)
- contexto da rádio: [client/src/contexts/RadioContext.tsx](/root/qz/quizgayon2/client/src/contexts/RadioContext.tsx)

## Segurança e regras importantes

### Admin

Rotas administrativas usam `X-Admin-Password` e exigem `ADMIN_PASSWORD`.

O servidor falha na inicialização se `ADMIN_PASSWORD` não estiver configurada.

### Sessão de quiz

O token de sessão do quiz:

- é gerado em `/api/quiz/start`
- é persistido em `quiz_tokens` no PostgreSQL
- expira
- é consumido de forma transacional junto com o salvamento do score

Isso evita perda de sessão em restart e corrige problemas de reuso/consumo prematuro.

### Anti-spam

O sistema anti-spam usa PostgreSQL, não memória efêmera.

Camadas principais:

- rate limit por IP
- cooldown entre submissões
- detecção de comportamento idêntico
- detecção de nomes similares
- banimento temporário de IP

Implementação: [server/middleware/antiSpam.ts](/root/qz/quizgayon2/server/middleware/antiSpam.ts)

## Endpoints principais

### Quiz e ranking

- `GET /api/quiz/start`
- `POST /api/scores`
- `GET /api/leaderboard`
- `GET /api/stats`

### Chat

- `GET /api/chat/recent`
- WebSocket via Socket.IO

### Rádio

- `GET /api/radio/stream`
- `GET /api/radio/nowplaying`
- `GET /api/radio/stats`
- `POST /api/radio/admin/next`
- `POST /api/radio/admin/restart`
- `GET /api/radio/admin/playlist`
- `POST /api/radio/admin/play/:index`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/bans`
- `PUT /api/admin/antispam/config`
- `DELETE /api/scores/:id`
- `DELETE /api/chat/messages/:id`

As rotas de debug/admin sensíveis estão protegidas.

## Desenvolvimento local

Pré-requisitos:

- Node.js `>=20.19.0`
- `pnpm`
- PostgreSQL
- `ffmpeg`

Instalação:

```bash
pnpm install
cp .env.example .env
```

Desenvolvimento:

```bash
pnpm dev
pnpm dev:server
pnpm dev:full
```

Verificação:

```bash
pnpm check
pnpm build
```

## Scripts

- `pnpm dev` -> frontend Vite
- `pnpm dev:server` -> backend Express
- `pnpm dev:full` -> frontend + backend
- `pnpm build` -> build de produção
- `pnpm start` -> inicia servidor em produção
- `pnpm check` -> TypeScript sem emitir arquivos

## Variáveis de ambiente

Obrigatórias:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `RADIO_ADMIN_KEY`

O projeto também usa:

- `PORT`
- `SOCKET_ORIGINS`

Exemplo base: [.env.example](/root/qz/quizgayon2/.env.example)

## Deploy

### Railway

O deploy ativo está na Railway e usa [railway.json](/root/qz/quizgayon2/railway.json) + [Dockerfile](/root/qz/quizgayon2/Dockerfile).

Fluxo típico:

```bash
railway login
railway link
railway up --service web --detach
```

O serviço atual conhecido:

- projeto: `spectacular-intuition`
- service: `web`
- branch: `master`

## Observações práticas

- A rádio não preserva o ponto exato em reload; ela reconecta ao stream ao vivo, que é o comportamento esperado.
- A navegação interna foi ajustada para não forçar reload completo nas rotas principais.
- O bundle já foi dividido com lazy loading para reduzir o peso inicial.

## Arquivos úteis

- app shell e rotas: [client/src/App.tsx](/root/qz/quizgayon2/client/src/App.tsx)
- página principal do quiz: [client/src/pages/Home.tsx](/root/qz/quizgayon2/client/src/pages/Home.tsx)
- seletor de quizzes: [client/src/pages/QuizSelector.tsx](/root/qz/quizgayon2/client/src/pages/QuizSelector.tsx)
- painel admin da rádio: [client/src/pages/AdminRadio.tsx](/root/qz/quizgayon2/client/src/pages/AdminRadio.tsx)
- dashboard admin: [client/src/components/AdminDashboard.tsx](/root/qz/quizgayon2/client/src/components/AdminDashboard.tsx)

## Situação do repositório

Este `README` foi alinhado ao estado atual do código e do deploy, não ao histórico antigo do projeto.
