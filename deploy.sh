#!/bin/bash

echo "🚀 Script de Deploy - QuiZoeira"
echo "================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Mudanças detectadas. Preparando commit..."
    
    # Adicionar todos os arquivos
    git add .
    
    # Fazer commit com a mensagem preparada
    if [ -f "GIT_COMMIT_MESSAGE.txt" ]; then
        git commit -F GIT_COMMIT_MESSAGE.txt
    else
        git commit -m "feat: Adiciona painel de admin da rádio e melhorias de UI"
    fi
    
    echo "✅ Commit realizado com sucesso!"
else
    echo "ℹ️  Nenhuma mudança para commitar"
fi

echo ""
echo "🔄 Fazendo push para o repositório..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy iniciado com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Acesse o painel da Railway"
    echo "2. Configure a variável RADIO_ADMIN_KEY"
    echo "3. Aguarde o deploy automático"
    echo "4. Acesse /admin-radio para testar"
    echo ""
    echo "📖 Consulte RAILWAY_SETUP.md para mais detalhes"
else
    echo ""
    echo "❌ Erro ao fazer push. Verifique suas credenciais do Git."
    exit 1
fi
