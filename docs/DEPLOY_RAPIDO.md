# Deploy Rápido no Railway - Gay Quiz 🚀

## ⚡ 5 Minutos para Colocar Online

### 1️⃣ Criar Repositório no GitHub
```bash
# No seu computador, na pasta do projeto
git init
git add .
git commit -m "Gay Quiz - Pronto para deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/gay-quiz.git
git push -u origin main
```

### 2️⃣ Acessar Railway
- Vá para [railway.app](https://railway.app)
- Clique em **"New Project"**
- Selecione **"Deploy from GitHub"**

### 3️⃣ Conectar GitHub
- Clique em **"Connect GitHub"**
- Autorize o Railway
- Selecione o repositório `gay-quiz`

### 4️⃣ Configurar Variáveis
No painel do Railway:
1. Vá para **"Variables"**
2. Adicione:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

### 5️⃣ Deploy
- Clique em **"Deploy"**
- Aguarde 2-5 minutos
- Pronto! 🎉

## 📍 Seu Link Público
Após o deploy, você terá um link como:
```
https://gay-quiz-production.up.railway.app
```

## 🔄 Atualizar o Site
Sempre que quiser fazer mudanças:

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

Railway fará o deploy automaticamente!

## 🌐 Usar Seu Domínio Customizado
1. No Railway, vá para **"Settings"** → **"Domains"**
2. Clique em **"Add Custom Domain"**
3. Adicione seu domínio (ex: quiz.meudominio.com)
4. Configure o DNS na Cloudflare com um CNAME apontando para o Railway

## ✅ Pronto!
Seu Gay Quiz está online para zoar com os amigos! 🎊
