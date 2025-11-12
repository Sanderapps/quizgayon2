# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2025-11-12] - Tarefa #14 Concluída - Animação do Menu

### Corrigido
- **Animação do menu**: Menu agora expande suavemente do botão e retorna a ele ao fechar
- Substituída animação `slideDown` por `expandFromButton` com efeito de bounce
- Transform-origin ajustado para `top right` para alinhar com a posição do botão
- Animação mais natural e intuitiva usando cubic-bezier

### Detalhes Técnicos
- Arquivo modificado: `TopMenu.tsx`
- Commit: `3537715`

## [2025-11-12] - Tarefa #1 Concluída - Sistema de Rádio Local

### Adicionado
- **Sistema de rádio local**: Substituída stream externa por player de músicas locais
- Playlist em formato JSON (`/music/playlist.json`) com shuffle automático
- Exibição de título e artista da música atual no player
- **Botão "Peça sua Música"**: Modal para usuários solicitarem músicas
- Backend completo para gerenciar pedidos de música
- Nova tabela `music_requests` no PostgreSQL
- API endpoints: `POST /api/music-requests`, `GET /api/music-requests`, `PATCH /api/music-requests/:id`
- Primeira música da playlist: Eurythmics - Sweet Dreams (Are Made of This)

### Como adicionar músicas
1. Adicione arquivos MP3 na pasta `client/public/music/`
2. Atualize o arquivo `client/public/music/playlist.json` com os metadados
3. Faça commit e push das mudanças

### Detalhes Técnicos
- Arquivos modificados: `RadioContext.tsx`, `RadioPlayer.tsx`
- Novos arquivos: `musicRequest.controller.ts`, `musicRequestService.ts`, `musicRequest.routes.ts`
- Migration: `create_music_requests.sql`
- Commit: `9be163a`

## [2025-11-12] - Bug #17 Corrigido

### Corrigido
- **Tela de apresentação dos quizzes**: Substituído conteúdo hard-coded (emoji, título, descrição) por dados dinâmicos do `currentQuiz`
- Agora cada quiz (gay, político, regional) exibe sua própria tela de apresentação corretamente
- Os quizzes político e regional não exibem mais o conteúdo do quiz gay na tela inicial

### Detalhes Técnicos
- Arquivo modificado: `client/src/pages/Home.tsx` (linhas 488-496)
- Commit: `1bc613f`

## [2025-11-12] - Tarefa #16 Concluída

### Melhorado
- **Limite do leaderboard**: Aumentado de 12 para 100 jogadores por ranking
- Agora exibe até 50 divas (percentual ≥ 50%) e 50 alfas (percentual < 50%)
- Aplica-se tanto à tela inicial quanto à tela de resultados

### Detalhes Técnicos
- Arquivo modificado: `client/src/pages/Home.tsx` (linhas 515, 578)
- Commit: `486a48c`

## [2025-11-12] - Bug #6 Investigado

### Status
- **Sistema de rankings**: Funcionando corretamente
- O placar vazio para quizzes político e regional é esperado (sem dados salvos ainda)
- Backend e frontend estão corretamente configurados para suportar múltiplos quizzes
- Cada quiz tem seu próprio ranking separado no banco de dados
