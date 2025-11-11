import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatReport {
  id: number;
  message_id: number;
  reason: string;
  reported_at: string;
  apelido: string;
  mensagem: string;
}

interface ChatMessage {
  id: number;
  apelido: string;
  mensagem: string;
  cor: string;
  emoji_avatar: string;
  data_envio: string;
}

interface Score {
  id: number;
  apelido: string;
  pontuacao: number;
  tempo_segundos: number;
  data_registro: string;
}

interface IpBan {
  ip: string;
  reason: string;
  banned_at: string;
  expires_at: string;
}

interface AntiSpamConfig {
  rateLimitWindowMs: number;
  maxSubmissionsPerWindow: number;
  cooldownMs: number;
  prefixWindowMs: number;
  maxPrefixSubmissions: number;
  behaviorWindowMs: number;
  maxIdenticalBehavior: number;
  banDurationMs: number;
}

export function AdminDashboard() {
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [bans, setBans] = useState<IpBan[]>([]);
  const [antiSpamConfig, setAntiSpamConfig] = useState<AntiSpamConfig | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedScores, setSelectedScores] = useState<number[]>([]);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalScores: 0,
    avgScore: "0",
    topChatters: []
  });

  const loadData = async () => {
    try {
      await Promise.all([
        loadReports(),
        loadRecentMessages(),
        loadScores(),
        loadBans(),
        loadAntiSpamConfig(),
        loadStats()
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const loadReports = async () => {
    const response = await fetch("/api/chat/reports");
    const data = await response.json();
    if (data.success) setReports(data.reports);
  };

  const loadRecentMessages = async () => {
    const response = await fetch("/api/chat/recent");
    const data = await response.json();
    if (data.success) setRecentMessages(data.messages);
  };

  const loadScores = async () => {
    const response = await fetch("/api/leaderboard");
    const data = await response.json();
    if (data.success) setScores(data.leaderboard);
  };

  const loadBans = async () => {
    const response = await fetch("/api/admin/bans", {
      headers: { "X-Admin-Password": adminPassword }
    });
    const data = await response.json();
    if (data.success) setBans(data.bans);
  };

  const loadAntiSpamConfig = async () => {
    const response = await fetch("/api/admin/antispam/config", {
      headers: { "X-Admin-Password": adminPassword }
    });
    const data = await response.json();
    if (data.success) setAntiSpamConfig(data.config);
  };

  const loadStats = async () => {
    const response = await fetch("/api/admin/stats", {
      headers: { "X-Admin-Password": adminPassword }
    });
    const data = await response.json();
    if (data.success) setStats(data.stats);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (adminPassword === "@dm1n321" || adminPassword === process.env.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Deletar esta mensagem?")) return;
    try {
      await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: { "X-Admin-Password": adminPassword }
      });
      loadRecentMessages();
      loadReports();
    } catch (error) {
      alert("Erro ao deletar mensagem");
    }
  };

  const handleDeleteAllMessages = async () => {
    if (!confirm("ATENÇÃO: Deletar TODAS as mensagens do chat?")) return;
    if (!confirm("Tem certeza? Esta ação não pode ser desfeita!")) return;
    
    try {
      await fetch("/api/admin/chat/clear-all", {
        method: "DELETE",
        headers: { "X-Admin-Password": adminPassword }
      });
      alert("Todas as mensagens foram deletadas!");
      loadRecentMessages();
    } catch (error) {
      alert("Erro ao deletar mensagens");
    }
  };

  const handleBanUser = async () => {
    const apelido = prompt("Digite o apelido do usuário para banir:");
    if (!apelido) return;

    try {
      await fetch("/api/admin/chat/ban-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword
        },
        body: JSON.stringify({ apelido })
      });
      alert(`Usuário ${apelido} banido!`);
    } catch (error) {
      alert("Erro ao banir usuário");
    }
  };

  const handleEditScore = async () => {
    if (!editingScore) return;

    try {
      await fetch(`/api/admin/scores/${editingScore.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword
        },
        body: JSON.stringify({
          apelido: editingScore.apelido,
          pontuacao: editingScore.pontuacao,
          tempo_segundos: editingScore.tempo_segundos
        })
      });
      alert("Pontuação atualizada!");
      setEditingScore(null);
      loadScores();
    } catch (error) {
      alert("Erro ao editar pontuação");
    }
  };

  const handleDeleteSelectedScores = async () => {
    if (selectedScores.length === 0) return;
    if (!confirm(`Deletar ${selectedScores.length} pontuações selecionadas?`)) return;

    try {
      await fetch("/api/admin/scores/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword
        },
        body: JSON.stringify({ ids: selectedScores })
      });
      alert("Pontuações deletadas!");
      setSelectedScores([]);
      loadScores();
    } catch (error) {
      alert("Erro ao deletar pontuações");
    }
  };

  const handleExportScores = async () => {
    window.open(`/api/admin/scores/export?password=${adminPassword}`, "_blank");
  };

  const handleRemoveBan = async (ip: string) => {
    if (!confirm(`Remover banimento de ${ip}?`)) return;

    try {
      await fetch(`/api/admin/bans/${encodeURIComponent(ip)}`, {
        method: "DELETE",
        headers: { "X-Admin-Password": adminPassword }
      });
      alert("Banimento removido!");
      loadBans();
    } catch (error) {
      alert("Erro ao remover banimento");
    }
  };

  const handleAddBan = async () => {
    const ip = prompt("Digite o IP para banir:");
    if (!ip) return;
    const reason = prompt("Motivo do banimento:");
    if (!reason) return;
    const hours = prompt("Duração em horas:", "6");

    try {
      await fetch("/api/admin/bans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword
        },
        body: JSON.stringify({ ip, reason, durationHours: parseInt(hours || "6") })
      });
      alert(`IP ${ip} banido!`);
      loadBans();
    } catch (error) {
      alert("Erro ao banir IP");
    }
  };

  const handleUpdateAntiSpamConfig = async () => {
    if (!antiSpamConfig) return;

    try {
      await fetch("/api/admin/antispam/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword
        },
        body: JSON.stringify(antiSpamConfig)
      });
      alert("Configuração atualizada!");
    } catch (error) {
      alert("Erro ao atualizar configuração");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md p-8 bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            👮 Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
            Digite a senha de administrador:
          </p>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Senha"
            className="w-full px-4 py-2 border-2 border-pink-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold"
          >
            Entrar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-black p-4 pt-20 pb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          👮 Admin Dashboard
        </h1>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="stats">📊 Estatísticas</TabsTrigger>
            <TabsTrigger value="chat">💬 Chat</TabsTrigger>
            <TabsTrigger value="scores">🏆 Placar</TabsTrigger>
            <TabsTrigger value="bans">🛡️ Banimentos</TabsTrigger>
            <TabsTrigger value="antispam">⚙️ Anti-Spam</TabsTrigger>
          </TabsList>

          {/* Aba Estatísticas */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  📊 Reports Pendentes
                </h3>
                <p className="text-3xl font-bold text-pink-500">{reports.length}</p>
              </Card>
              
              <Card className="p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  💬 Total de Mensagens
                </h3>
                <p className="text-3xl font-bold text-purple-500">{stats.totalMessages}</p>
              </Card>
              
              <Card className="p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  🏆 Total de Pontuações
                </h3>
                <p className="text-3xl font-bold text-blue-500">{stats.totalScores}</p>
              </Card>

              <Card className="p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  📈 Média de Pontuação
                </h3>
                <p className="text-3xl font-bold text-green-500">{stats.avgScore}</p>
              </Card>
            </div>

            {/* Top Chatters */}
            <Card className="p-6 bg-white dark:bg-gray-800 mt-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                🗣️ Usuários Mais Ativos no Chat
              </h2>
              <div className="space-y-2">
                {stats.topChatters.map((chatter: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-bold text-gray-800 dark:text-white">
                      {index + 1}. {chatter.apelido}
                    </span>
                    <span className="text-purple-500 font-bold">
                      {chatter.message_count} mensagens
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Aba Chat */}
          <TabsContent value="chat">
            <div className="space-y-6">
              {/* Ações Rápidas */}
              <Card className="p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  ⚡ Ações Rápidas
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleDeleteAllMessages} className="bg-red-500 hover:bg-red-600">
                    🗑️ Deletar Todas Mensagens
                  </Button>
                  <Button onClick={handleBanUser} className="bg-orange-500 hover:bg-orange-600">
                    🚫 Banir Usuário
                  </Button>
                </div>
              </Card>

              {/* Reports */}
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  🚨 Reports Recentes
                </h2>
                {reports.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                    Nenhum report pendente
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="border-2 border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white">
                              {report.apelido}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(report.reported_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                            {report.reason}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mb-3 p-2 bg-white dark:bg-gray-800 rounded">
                          "{report.mensagem}"
                        </p>
                        <Button
                          onClick={() => handleDeleteMessage(report.message_id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          🗑️ Deletar Mensagem
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Mensagens Recentes */}
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  💬 Mensagens Recentes (Últimas 20)
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-2xl">{msg.emoji_avatar}</span>
                      <div className="flex-1">
                        <span
                          className="font-bold"
                          style={{ color: msg.cor }}
                        >
                          {msg.apelido}:
                        </span>{" "}
                        <span className="text-gray-800 dark:text-gray-200">
                          {msg.mensagem}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Placar */}
          <TabsContent value="scores">
            <div className="space-y-6">
              {/* Ações */}
              <Card className="p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  ⚡ Ações
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleDeleteSelectedScores} disabled={selectedScores.length === 0} className="bg-red-500 hover:bg-red-600">
                    🗑️ Deletar Selecionados ({selectedScores.length})
                  </Button>
                  <Button onClick={handleExportScores} className="bg-green-500 hover:bg-green-600">
                    📥 Exportar CSV
                  </Button>
                </div>
              </Card>

              {/* Lista de Pontuações */}
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  🏆 Placar (Top 50)
                </h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {scores.slice(0, 50).map((score, index) => (
                    <div
                      key={score.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScores.includes(score.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScores([...selectedScores, score.id]);
                          } else {
                            setSelectedScores(selectedScores.filter(id => id !== score.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-gray-600 dark:text-gray-400 w-8">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-gray-800 dark:text-white">
                          {score.apelido}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {score.pontuacao} pts • {score.tempo_segundos}s
                        </span>
                      </div>
                      <button
                        onClick={() => setEditingScore(score)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Modal de Edição */}
              {editingScore && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                  <Card className="p-6 bg-white dark:bg-gray-800 max-w-md w-full">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                      ✏️ Editar Pontuação
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Apelido
                        </label>
                        <input
                          type="text"
                          value={editingScore.apelido}
                          onChange={(e) => setEditingScore({ ...editingScore, apelido: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Pontuação
                        </label>
                        <input
                          type="number"
                          value={editingScore.pontuacao}
                          onChange={(e) => setEditingScore({ ...editingScore, pontuacao: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Tempo (segundos)
                        </label>
                        <input
                          type="number"
                          value={editingScore.tempo_segundos}
                          onChange={(e) => setEditingScore({ ...editingScore, tempo_segundos: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleEditScore} className="flex-1 bg-green-500 hover:bg-green-600">
                          💾 Salvar
                        </Button>
                        <Button onClick={() => setEditingScore(null)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                          ❌ Cancelar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba Banimentos */}
          <TabsContent value="bans">
            <div className="space-y-6">
              <Card className="p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  ⚡ Ações
                </h3>
                <Button onClick={handleAddBan} className="bg-red-500 hover:bg-red-600">
                  🚫 Banir IP Manualmente
                </Button>
              </Card>

              <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  🛡️ IPs Banidos ({bans.length})
                </h2>
                {bans.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                    Nenhum IP banido no momento
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bans.map((ban) => (
                      <div
                        key={ban.ip}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800"
                      >
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white">
                            {ban.ip}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ban.reason}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Expira: {new Date(ban.expires_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleRemoveBan(ban.ip)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          ✅ Desbanir
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Aba Anti-Spam */}
          <TabsContent value="antispam">
            <Card className="p-6 bg-white dark:bg-gray-800">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                ⚙️ Configuração do Anti-Spam
              </h2>
              {antiSpamConfig && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Janela de Rate Limit (ms)
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.rateLimitWindowMs}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, rateLimitWindowMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 60000 (1 minuto)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Máx. Submissões por Janela
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.maxSubmissionsPerWindow}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, maxSubmissionsPerWindow: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 3</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Cooldown entre Submissões (ms)
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.cooldownMs}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, cooldownMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 30000 (30 segundos)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Duração do Banimento (ms)
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.banDurationMs}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, banDurationMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 21600000 (6 horas)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Janela de Detecção de Prefixo (ms)
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.prefixWindowMs}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, prefixWindowMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 300000 (5 minutos)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Máx. Submissões com Mesmo Prefixo
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.maxPrefixSubmissions}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, maxPrefixSubmissions: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 3</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Janela de Comportamento Idêntico (ms)
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.behaviorWindowMs}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, behaviorWindowMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 600000 (10 minutos)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Máx. Comportamentos Idênticos
                      </label>
                      <input
                        type="number"
                        value={antiSpamConfig.maxIdenticalBehavior}
                        onChange={(e) => setAntiSpamConfig({ ...antiSpamConfig, maxIdenticalBehavior: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão: 2</p>
                    </div>
                  </div>

                  <Button onClick={handleUpdateAntiSpamConfig} className="w-full bg-green-500 hover:bg-green-600">
                    💾 Salvar Configuração
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
