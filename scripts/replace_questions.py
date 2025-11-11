#!/usr/bin/env python3
# Script para substituir perguntas antigas por novas no Home.tsx

# Ler arquivo com novas perguntas
with open('/home/ubuntu/quizgayon2/new_hard_questions.ts', 'r', encoding='utf-8') as f:
    new_questions_content = f.read()

# Extrair apenas o array de perguntas
import re
match = re.search(r'const HARD_QUESTIONS = \[(.*)\];', new_questions_content, re.DOTALL)
if match:
    new_questions_array = match.group(1).strip()
else:
    print("Erro: não encontrou array de perguntas")
    exit(1)

# Ler arquivo Home.tsx
with open('/home/ubuntu/quizgayon2/client/src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

# Substituir perguntas antigas por novas
# Encontrar início e fim do QUESTIONS_POOL
start_marker = 'const QUESTIONS_POOL: Question[] = ['
end_marker = '\n];\n\nconst RESULTS: Result[]'

start_idx = home_content.find(start_marker)
end_idx = home_content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Erro: não encontrou marcadores")
    exit(1)

# Montar novo conteúdo
new_home_content = (
    home_content[:start_idx + len(start_marker)] +
    '\n' + new_questions_array + '\n' +
    home_content[end_idx:]
)

# Salvar arquivo modificado
with open('/home/ubuntu/quizgayon2/client/src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(new_home_content)

print("✅ Perguntas substituídas com sucesso!")
