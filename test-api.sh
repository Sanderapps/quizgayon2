#!/bin/bash

# Script de teste para validar a API do QuizGayon2
# Este script testa todos os endpoints da API

echo "🧪 Iniciando testes da API do QuizGayon2..."
echo ""

API_URL="${API_URL:-http://localhost:3000/api}"

echo "📍 URL da API: $API_URL"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  
  echo -e "${YELLOW}Testando: $name${NC}"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✅ Sucesso (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}❌ Falha (HTTP $http_code)${NC}"
    echo "$body"
  fi
  
  echo ""
}

# Teste 1: Salvar pontuação
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  POST /api/scores - Salvar Pontuação"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Salvar pontuação de teste" "POST" "/scores" \
  '{"apelido":"TestUser","pontuacao":850,"tempo_segundos":45.5}'

# Teste 2: Salvar outra pontuação
test_endpoint "Salvar segunda pontuação" "POST" "/scores" \
  '{"apelido":"JoãoGamer","pontuacao":950,"tempo_segundos":40.2}'

# Teste 3: Salvar terceira pontuação
test_endpoint "Salvar terceira pontuação" "POST" "/scores" \
  '{"apelido":"MariaQuiz","pontuacao":900,"tempo_segundos":38.5}'

# Teste 4: Buscar placar
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  GET /api/leaderboard - Buscar Placar"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Buscar top 10" "GET" "/leaderboard?limit=10"

# Teste 5: Buscar estatísticas
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  GET /api/stats - Buscar Estatísticas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Buscar estatísticas gerais" "GET" "/stats"

# Teste 6: Validação de campos obrigatórios
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Teste de Validação"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Tentar salvar sem campos obrigatórios" "POST" "/scores" \
  '{"apelido":"Incompleto"}'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Testes concluídos!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
