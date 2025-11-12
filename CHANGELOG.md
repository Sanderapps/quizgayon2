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
