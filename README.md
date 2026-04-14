> **Nota do Desenvolvedor:** Este README foi reescrito a partir de uma análise direta do código-fonte para garantir 100% de precisão técnica e refletir o estado real do projeto.

# QuizGayon2 🌈 - Análise Técnica e Documentação

Quiz interativo e humorístico evoluído para uma aplicação full-stack completa com placar de líderes global, API REST, chat em tempo real e um robusto sistema de segurança anti-spam, tudo pronto para produção e deploy na Railway.

---

## 🌟 Funcionalidades Implementadas

| Categoria | Funcionalidade | Status e Detalhes |
|---|---|---|
| **Quiz** | Sistema de perguntas e pontuação | ✅ **15 perguntas** aleatórias de um **pool de 50**. Pontuação máxima: **60 pontos**. |
| **Competição** | Placar de Líderes Global | ✅ Armazenado em **PostgreSQL**, ordenado por pontuação e tempo. |
| **API** | API REST completa | ✅ Endpoints para pontuações, placar, estatísticas e chat. |
| **Interatividade** | Chat em Tempo Real | ✅ Implementado com **Socket.IO**, com persistência de mensagens. |
| **Segurança** | Sistema Anti-Spam e Anti-Fraude | ✅ **Múltiplas camadas** (rate limit, cooldown, banimento de IP, etc.). |
| **Admin** | Endpoints de Debug e Moderação | ✅ Protegidos por senha para limpar dados e gerenciar o chat. |
| **Deploy** | Configuração para deploy na Railway | ✅ Automatizado via `railway.json` e Nixpacks. |

---

## 🔐 Sistema de Segurança (Anti-Spam)

O projeto possui um sistema de defesa sofisticado para proteger a integridade do placar. **Importante: este sistema opera em memória e é resetado a cada reinicialização do servidor.**

| Proteção | Limite | Duração |
|---|---|---|
| **Rate Limit de Submissão** | 3 submissões | 1 minuto |
| **Cooldown entre Submissões** | 1 submissão | 30 segundos |
| **Variação de Apelido** | 3 submissões com mesmo prefixo | 5 minutos |
| **Comportamento Idêntico** | 2 submissões (mesma pontuação+tempo) | 10 minutos |
| **Banimento de IP** | - | 6 horas |
| **Rate Limit de Chat** | 1 mensagem | 2 segundos |

### Validação de Dados no Backend

O servidor também impõe as seguintes regras na submissão de pontuação:

- **Pontuação:** Deve ser um número entre 0 e 60.
- **Tempo:** Deve ser um número entre 45 e 3600 segundos.
- **Apelido:** Deve ter entre 1 e 20 caracteres.

---

## 🛠️ Arquitetura e Tecnologias

| Camada | Tecnologia | Propósito |
|---|---|---|
| **Frontend** | React 18.3, TypeScript, Vite, Tailwind CSS | Interface de usuário moderna e reativa. |
| **Backend** | Node.js, Express, TypeScript, Socket.IO | Servidor web para a API REST e WebSocket. |
| **Banco de Dados** | PostgreSQL | Armazenamento persistente de pontuações e mensagens. |
| **DevOps** | Railway, pnpm, esbuild, Nixpacks | Build, gerenciamento de pacotes e deploy. |

---

## 📁 Estrutura do Projeto

```
quizgayon2/
├── client/              # Aplicação Frontend (React + Vite)
├── server/              # Aplicação Backend (Node.js + Express)
│   ├── index.ts         # ⚠️ ARQUIVO MONOLÍTICO (29k linhas) com toda a lógica
│   └── db.ts            # Configuração e inicialização do PostgreSQL
├── shared/              # Código compartilhado
├── .env.example         # Exemplo de variáveis de ambiente
├── railway.json         # Configuração de deploy para a Railway
└── package.json         # Dependências e scripts
```

---

## 🗄️ Estrutura do Banco de Dados

O banco de dados PostgreSQL contém 3 tabelas principais:

1.  `scores`: Armazena as pontuações dos jogadores.
2.  `chat_messages`: Armazena o histórico do chat em tempo real.
3.  `chat_reports`: Armazena denúncias de mensagens do chat.

---

## 🔌 Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/quiz/start` | Inicia uma nova sessão de quiz e retorna um token. |
| POST | `/api/scores` | Salva uma nova pontuação. |
| GET | `/api/leaderboard` | Retorna o placar de líderes. |
| GET | `/api/stats` | Retorna estatísticas gerais. |
| GET | `/api/chat/recent` | Retorna as últimas mensagens do chat. |
| DELETE | `/api/scores/:id` | (Admin) Deleta uma pontuação. |
| DELETE | `/api/chat/messages/:id` | (Admin) Deleta uma mensagem do chat. |
| GET | `/api/chat/reports` | (Admin) Lista as denúncias de mensagens. |

---

## 🔴 Pontos de Melhoria Urgentes

1.  **Refatorar o Servidor Monolítico:** O arquivo `server/index.ts` com quase 30.000 linhas é uma grande dívida técnica e precisa ser modularizado.
2.  **Persistir o Estado do Anti-Spam:** O sistema anti-spam em memória é ineficaz contra reinicializações. Migrar para **Redis** ou PostgreSQL é crucial.
3.  **Implementar Validação de Schema com Zod:** Embora existam validações manuais, usar **Zod** (já nas dependências) para validar os inputs da API tornaria o código mais limpo e seguro.

---

## 🚀 Deploy

### Railway (Recomendado)

Este projeto está configurado para deploy na **Railway** com suporte completo a WebSockets e PostgreSQL.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.com/project/1ce4c5a0-0044-4b31-b2c4-dce9e43ded73)

**URL de Produção:** https://web-production-b5e40.up.railway.app

**Como deployar:**

```bash
# Instalar Railway CLI e fazer login
railway login

# Linkar o projeto e fazer deploy
railway link --project spectacular-intuition
railway up --service web --detach
```

**Configuração do PostgreSQL:**
O Railway provisiona automaticamente o banco de dados PostgreSQL e configura a variável `DATABASE_URL`.

**Variáveis de Ambiente:**
- `ADMIN_PASSWORD` - Senha do painel admin
- `RADIO_ADMIN_KEY` - Chave de acesso à administração da rádio
- `DATABASE_URL` - Configurada automaticamente pelo Railway

> ⚠️ **Nota:** A Vercel **NÃO** é recomendada para este projeto pois não suporta WebSockets/Socket.IO necessários para o chat em tempo real e streaming de rádio.

---

## 📦 Instalação e Desenvolvimento

**Pré-requisitos:** Node.js (>=20), pnpm, e uma instância do PostgreSQL.

1.  **Clonar:** `git clone https://github.com/Sanderapps/quizgayon2.git && cd quizgayon2`
2.  **Instalar:** `pnpm install`
3.  **Configurar:** `cp .env.example .env` e edite o arquivo `.env` com sua `DATABASE_URL`.
4.  **Executar:** `pnpm run dev`

O frontend estará disponível em `http://localhost:5173` (ou outra porta) e o backend em `http://localhost:3000`.
