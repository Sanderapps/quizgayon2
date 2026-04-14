# 🚀 Guia de Deploy - QuizGayon2

## ✅ Deploy Realizado

### Railway Platform

**Projeto:** spectacular-intuition  
**Serviço:** web  
**Ambiente:** production  
**Status:** Deploy inicial concluído (aguardando PostgreSQL)

---

## 📋 Próximos Passos

### 1. Adicionar PostgreSQL (OBRIGATÓRIO)

O deploy está funcionando, mas o aplicativo precisa de um banco de dados PostgreSQL.

**Como adicionar:**

1. Acesse o dashboard do Railway:
   ```
   https://railway.com/project/1ce4c5a0-0044-4b31-b2c4-dce9e43ded73?environmentId=8b0131d3-4396-49ef-a95f-b7c3e6f09dee
   ```

2. Clique em **"New"** → **"Database"** → **"PostgreSQL"**

3. Railway vai automaticamente:
   - Provisionar o banco PostgreSQL
   - Configurar a variável `DATABASE_URL` 
   - Conectar ao serviço web

4. O serviço web será automaticamente redeployed com o banco de dados

### 2. Verificar Deploy

Após adicionar o PostgreSQL:

```bash
# Verificar status
railway service status --service web

# Ver logs em tempo real
railway logs --service web

# Abrir aplicação
railway open
```

---

## 🔧 Variáveis de Ambiente Configuradas

✅ `ADMIN_PASSWORD=@dm1n321`  
✅ `RADIO_ADMIN_KEY=radio_secret_2024`  
⏳ `DATABASE_URL` - Será configurado automaticamente ao adicionar PostgreSQL

---

## 🌐 URLs do Projeto

- **Dashboard:** https://railway.com/project/1ce4c5a0-0044-4b31-b2c4-dce9e43ded73
- **Produção:** (será gerado após deploy com PostgreSQL)

---

## 📝 Notas Importantes

### Por que Railway e não Vercel?

Este projeto usa:
- ✅ **Socket.IO** para chat em tempo real
- ✅ **WebSocket connections** para comunicação bidirecional
- ✅ **Servidor Express** persistente para streaming de rádio
- ✅ **PostgreSQL** para persistência de dados

**Vercel NÃO suporta:**
- ❌ WebSockets/Socket.IO (serverless architecture)
- ❌ Servidores persistentes
- ❌ Conexões de longa duração

Railway é a plataforma ideal para aplicações full-stack com necessidades de servidor persistente.

---

## 🔄 Redeploy Manual

Se precisar fazer deploy de novas alterações:

```bash
cd /data/data/com.termux/files/home/quizgayon2
railway up --service web --detach
```

---

## 🎯 Checklist Final

- [x] Linkar projeto ao Railway
- [x] Criar serviço web
- [x] Deploy do código
- [x] Configurar variáveis de ambiente (ADMIN_PASSWORD, RADIO_ADMIN_KEY)
- [ ] **Adicionar PostgreSQL** ← FAZER PELO DASHBOARD
- [ ] Verificar deploy com banco de dados
- [ ] Testar aplicação

---

## 🆘 Troubleshooting

### Deploy falhou com "ECONNREFUSED 5432"
- **Causa:** PostgreSQL não configurado
- **Solução:** Adicionar PostgreSQL pelo dashboard (veja passo 1)

### Variáveis de ambiente faltando
- **Verificar:** `railway variable list --service web`
- **Configurar:** `railway variable set "KEY=value" --service web`

### Logs do deploy
- **Ver:** `railway logs --service web`

---

**Última atualização:** 2026-04-14
