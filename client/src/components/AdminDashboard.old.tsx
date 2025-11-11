import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export function AdminDashboard() {
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      const response = await fetch("/api/chat/reports");
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Erro ao carregar reports:", error);
    }
  };

  const loadRecentMessages = async () => {
    try {
      const response = await fetch("/api/chat/recent");
      const data = await response.json();
      if (data.success) {
        setRecentMessages(data.messages);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
      loadRecentMessages();
      
      // Atualizar a cada 10 segundos
      const interval = setInterval(() => {
        loadReports();
        loadRecentMessages();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    // Verificação simples - em produção, deve ser no backend
    if (adminPassword === "admin123" || adminPassword === process.env.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Deletar esta mensagem?")) return;

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword
        }
      });

      if (response.ok) {
        alert("Mensagem deletada!");
        loadReports();
        loadRecentMessages();
      } else {
        alert("Erro ao deletar mensagem");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao deletar mensagem");
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          👮 Admin Dashboard
        </h1>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              📊 Reports Pendentes
            </h3>
            <p className="text-3xl font-bold text-pink-500">{reports.length}</p>
          </Card>
          
          <Card className="p-4 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              💬 Mensagens Recentes
            </h3>
            <p className="text-3xl font-bold text-purple-500">{recentMessages.length}</p>
          </Card>
          
          <Card className="p-4 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              🛡️ Auto-Moderação
            </h3>
            <p className="text-sm text-green-500 font-bold">✅ Ativa (3 reports)</p>
          </Card>
        </div>

        {/* Reports */}
        <Card className="p-6 bg-white dark:bg-gray-800 mb-6">
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
    </div>
  );
}
