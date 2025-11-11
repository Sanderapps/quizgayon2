# Estrutura do Projeto QuizGayOn2

**Data da última organização:** 11/11/2025

## Visão Geral

Este é um projeto full-stack de quizzes humorísticos com sistema multi-quiz, chat ao vivo e rankings dinâmicos.

## Estrutura de Diretórios

```
quizgayon2/
├── client/                 # Frontend (React + TypeScript + Vite)
│   ├── public/            # Arquivos públicos estáticos
│   └── src/
│       ├── components/    # Componentes React reutilizáveis
│       │   ├── quiz/     # Componentes específicos do quiz
│       │   └── ui/       # Componentes de UI genéricos
│       ├── contexts/      # Contextos React (Theme, etc.)
│       ├── data/          # Dados estáticos e quizzes
│       │   └── quizzes/  # Definições dos quizzes (gay, político, regional)
│       ├── hooks/         # Custom hooks React
│       ├── lib/           # Utilitários e helpers
│       ├── pages/         # Páginas da aplicação
│       └── services/      # Serviços de API
│
├── server/                 # Backend (Node.js + Express + TypeScript)
│   ├── config/            # Configurações (anti-spam, etc.)
│   ├── controllers/       # Lógica de negócio das rotas
│   │   ├── admin.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── quiz.controller.ts
│   │   └── scores.controller.ts
│   ├── middleware/        # Middlewares (anti-spam, auth, etc.)
│   ├── routes/            # Definições de rotas modulares
│   │   ├── admin.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── quiz.routes.ts
│   │   ├── scores.routes.ts
│   │   └── index.ts
│   ├── schemas/           # Schemas de validação (Zod)
│   ├── services/          # Serviços de negócio
│   │   ├── chatService.ts
│   │   ├── quizService.ts
│   │   └── scoreService.ts
│   ├── sockets/           # Configuração de WebSockets
│   │   └── chat.socket.ts
│   ├── db.ts              # Configuração do banco de dados
│   └── index.ts           # Ponto de entrada do servidor
│
├── shared/                 # Código compartilhado entre client e server
│   └── const.ts           # Constantes compartilhadas
│
├── docs/                   # Documentação do projeto
│   ├── API_DOCUMENTATION.md
│   ├── CORRECOES_MODULARIZACAO.md
│   ├── DEPLOY_RAPIDO.md
│   ├── RAILWAY_DEPLOY_GUIDE.md
│   └── ...
│
├── scripts/                # Scripts utilitários
│   ├── cleanup_guardian_spam.sql
│   ├── replace_questions.py
│   └── test-api.sh
│
├── temp/                   # Arquivos temporários e análises
│   ├── new_questions.ts
│   ├── category_colors.ts
│   └── ...
│
└── patches/                # Patches de dependências (pnpm)
    └── wouter@3.7.1.patch
```

## Arquivos de Configuração na Raiz

- `package.json` - Dependências e scripts do projeto
- `tsconfig.json` - Configuração do TypeScript
- `vite.config.ts` - Configuração do Vite (build frontend)
- `Dockerfile` - Configuração Docker para produção
- `railway.json` - Configuração para deploy na Railway
- `components.json` - Configuração de componentes UI (shadcn)
- `README.md` - Documentação principal do projeto

## Stack Tecnológica

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Wouter (roteamento)
- Socket.IO Client (chat em tempo real)
- Tailwind CSS (estilização)

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL (banco de dados)
- Socket.IO (WebSocket para chat)
- Zod (validação de schemas)

### Deploy
- Railway (plataforma de hospedagem)
- Docker (containerização)

## Sistema Multi-Quiz

O projeto suporta múltiplos quizzes através de uma arquitetura modular:

### Quizzes Disponíveis
1. **Gay Quiz** (`/quiz/gay`) - "Quão Gay Você É?"
2. **Político Quiz** (`/quiz/politico`) - "Lulista ou Bolsonarista?"
3. **Regional Quiz** (`/quiz/regional`) - "Sulista ou Nordestino?"

### Estrutura de um Quiz

Cada quiz é definido em `client/src/data/quizzes/` e contém:
- `{nome}Quiz.ts` - Configuração principal (tema, categorias, títulos)
- `{nome}Questions.ts` - Perguntas e respostas do quiz
- `types.ts` - Tipos TypeScript compartilhados

## Funcionalidades Principais

1. **Sistema de Quiz**
   - 50 perguntas por quiz
   - Respostas com emojis e pontuação
   - Títulos granulares baseados em porcentagem (a cada 3%)
   - Temas visuais personalizados por quiz

2. **Rankings Dinâmicos**
   - Rankings separados por categoria (ex: Divas vs Alfas)
   - Top 50 jogadores
   - Sistema de badges/conquistas

3. **Chat Global ao Vivo**
   - WebSocket em tempo real
   - Sistema anti-spam robusto
   - Moderação via painel admin

4. **Painel Administrativo**
   - Estatísticas em tempo real
   - Gerenciamento de mensagens do chat
   - Gerenciamento de pontuações
   - Sistema de banimentos
   - Configuração anti-spam
   - Changelog

## Rotas da API

### Públicas
- `GET /api/changelog` - Buscar changelog
- `POST /api/suggestions` - Enviar sugestão
- `GET /api/leaderboard` - Buscar ranking
- `POST /api/scores` - Salvar pontuação

### Admin (requer header `x-admin-password`)
- `GET /api/admin/stats` - Estatísticas expandidas
- `GET /api/admin/bans` - Listar IPs banidos
- `POST /api/admin/bans` - Banir IP
- `DELETE /api/admin/bans/:ip` - Desbanir IP
- `GET /api/admin/antispam/config` - Config anti-spam
- `PUT /api/admin/antispam/config` - Atualizar config
- `POST /api/admin/changelog` - Adicionar changelog
- `DELETE /api/debug/reset-leaderboard` - Resetar placar

### Chat (WebSocket)
- `send_message` - Enviar mensagem
- `delete_message` - Deletar mensagem (admin)

## Próximos Passos

1. Adicionar testes unitários para controllers
2. Implementar validação Zod em todas as rotas
3. Criar novos quizzes (ex: "Patricinha ou Maloqueira?")
4. Adicionar sistema de conquistas/badges
5. Implementar batalhas 1x1 entre usuários
