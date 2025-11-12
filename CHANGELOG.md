# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

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
