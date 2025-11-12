# Guia de Configuração - Railway

## Variáveis de Ambiente Necessárias

Para que o painel de administração da rádio funcione corretamente, você precisa adicionar a seguinte variável de ambiente no painel da Railway:

### RADIO_ADMIN_KEY

Esta é a chave secreta que será usada para autenticar o acesso ao painel de administração da rádio.

**Como configurar:**

1. Acesse o painel da Railway
2. Selecione o projeto `quizgayon2`
3. Vá em **Variables** (Variáveis)
4. Clique em **New Variable** (Nova Variável)
5. Adicione:
   - **Nome:** `RADIO_ADMIN_KEY`
   - **Valor:** Uma chave secreta forte (exemplo: `minha_chave_super_secreta_123`)

**Importante:**
- Escolha uma chave forte e única
- Não compartilhe esta chave publicamente
- Guarde esta chave em um lugar seguro, você precisará dela para acessar o painel de admin

## Como Acessar o Painel de Admin

Após fazer o deploy com a variável configurada:

1. Acesse: `https://seu-dominio.railway.app/admin-radio`
2. Digite a chave que você configurou em `RADIO_ADMIN_KEY`
3. Clique em "Entrar"

A chave será salva no navegador, então você não precisará digitá-la novamente.

## Funcionalidades do Painel

- **Pular Música:** Avança para a próxima música da playlist
- **Reiniciar Playlist:** Volta para a primeira música
- **Estatísticas:** Visualiza a música atual e total de músicas

Todas as ações afetam todos os ouvintes em tempo real.

## Deploy

O projeto já está configurado para deploy automático na Railway. Basta fazer o push das mudanças para o repositório:

```bash
git add .
git commit -m "Adiciona painel de admin da rádio e melhorias de UI"
git push origin main
```

A Railway detectará as mudanças e fará o deploy automaticamente.
