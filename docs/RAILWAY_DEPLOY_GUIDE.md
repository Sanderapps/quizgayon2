# Guia de Deploy no Railway - Gay Quiz

## 📋 Pré-requisitos

1. **Conta no Railway** - Crie uma conta em [railway.app](https://railway.app)
2. **GitHub** - Faça um fork ou clone deste repositório
3. **Git instalado** - Para fazer push do código

## 🚀 Passo a Passo para Deploy

### Passo 1: Preparar o Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Crie um novo repositório chamado `gay-quiz`
3. Clone o repositório na sua máquina:
   ```bash
   git clone https://github.com/SEU_USUARIO/gay-quiz.git
   cd gay-quiz
   ```

4. Copie todos os arquivos do projeto para a pasta do repositório
5. Faça o push inicial:
   ```bash
   git add .
   git commit -m "Initial commit: Gay Quiz"
   git push origin main
   ```

### Passo 2: Conectar Railway ao GitHub

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub"**
4. Clique em **"Connect GitHub"** e autorize o Railway
5. Selecione o repositório `gay-quiz`
6. Clique em **"Deploy"**

### Passo 3: Configurar Variáveis de Ambiente

1. No painel do Railway, vá para **"Variables"**
2. Adicione as seguintes variáveis:
   ```
   NODE_ENV=production
   PORT=3000
   ```

### Passo 4: Configurar o Build

1. No painel do Railway, vá para **"Settings"**
2. Em **"Build Command"**, coloque:
   ```bash
   npm install && npm run build
   ```

3. Em **"Start Command"**, coloque:
   ```bash
   npm run preview
   ```

### Passo 5: Deploy Automático

1. O Railway fará o deploy automaticamente
2. Aguarde a compilação (pode levar 2-5 minutos)
3. Quando terminar, você verá um link público no painel

### Passo 6: Acessar seu Quiz

1. Clique no link gerado pelo Railway
2. Seu quiz estará online! 🎉

## 🔄 Atualizações Futuras

Sempre que você fizer mudanças no código:

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

O Railway fará o deploy automaticamente!

## 📱 Domínio Customizado (Opcional)

Se quiser usar seu próprio domínio:

1. No painel do Railway, vá para **"Settings"**
2. Clique em **"Domains"**
3. Clique em **"Add Custom Domain"**
4. Adicione seu domínio (ex: quiz.meudominio.com)
5. Siga as instruções para configurar o DNS na Cloudflare

## 🆘 Troubleshooting

### Build falha com erro de dependências
- Verifique se o `package.json` está correto
- Tente deletar `node_modules` e fazer `npm install` novamente

### Aplicação não inicia
- Verifique os logs no painel do Railway
- Certifique-se de que o `package.json` tem os scripts corretos

### Porta não está acessível
- O Railway fornece a porta automaticamente via variável `PORT`
- Não é necessário configurar manualmente

## 📝 Estrutura de Arquivos Necessária

```
gay-quiz/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx
│   │   ├── components/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   └── package.json
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código feito push para GitHub
- [ ] Railway conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Deploy realizado com sucesso
- [ ] Link público testado e funcionando

## 🎉 Pronto!

Seu Gay Quiz está online e pronto para zoar com seus amigos!

Para mais informações sobre Railway, visite: [railway.app/docs](https://railway.app/docs)
