// Serviço de API para comunicação com o backend

export interface Score {
  id?: number;
  apelido: string;
  pontuacao: number;
  tempo_segundos: number;
  data_registro?: string;
}

export interface LeaderboardEntry {
  id: number;
  apelido: string;
  pontuacao: number;
  tempo_segundos: number;
  data_registro: string;
}

export interface Stats {
  total_jogadores: number;
  pontuacao_maxima: number;
  pontuacao_media: string;
  tempo_minimo: number;
}

const API_BASE_URL = "/api";

/**
 * Salva uma nova pontuação no banco de dados
 */
export async function salvarPontuacao(
  apelido: string,
  pontuacao: number,
  tempoSegundos: number,
  quizId: string = "gay"
): Promise<Score | null> {
  try {
    // Recuperar token de sessão
    const quizToken = sessionStorage.getItem('quiz_token');
    
    if (!quizToken) {
      console.error('Token de sessão não encontrado');
      alert('Sessão expirada. Por favor, recarregue a página e jogue novamente.');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apelido,
        pontuacao,
        tempo_segundos: tempoSegundos,
        quiz_id: quizId,
        quiz_token: quizToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro ao salvar pontuação:", error);
      return null;
    }

    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error("Erro de rede ao salvar pontuação:", error);
    return null;
  }
}

/**
 * Busca o placar de líderes global
 */
export async function buscarPlacar(
  limit: number = 100,
  quizId: string = "gay"
): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limit}&quiz_id=${quizId}`);

    if (!response.ok) {
      console.error("Erro ao buscar placar");
      return [];
    }

    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error("Erro de rede ao buscar placar:", error);
    return [];
  }
}

/**
 * Busca estatísticas gerais do quiz
 */
export async function buscarEstatisticas(): Promise<Stats | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);

    if (!response.ok) {
      console.error("Erro ao buscar estatísticas");
      return null;
    }

    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error("Erro de rede ao buscar estatísticas:", error);
    return null;
  }
}

/**
 * Deleta uma pontuação específica (apenas para administração)
 */
export async function deletarPontuacao(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/scores/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      console.error("Erro ao deletar pontuação");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro de rede ao deletar pontuação:", error);
    return false;
  }
}

/**
 * Converte porcentagem para pontuação absoluta
 * (útil para migração do sistema antigo baseado em porcentagem)
 */
export function percentualParaPontuacao(
  percentual: number,
  totalPerguntas: number = 15
): number {
  const maxPoints = totalPerguntas * 4;
  return Math.round((percentual / 100) * maxPoints);
}

/**
 * Converte pontuação absoluta para porcentagem
 */
export function pontuacaoParaPercentual(
  pontuacao: number,
  totalPerguntas: number = 15
): number {
  const maxPoints = totalPerguntas * 4;
  return Math.round((pontuacao / maxPoints) * 100);
}
