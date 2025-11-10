import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: number;
  apelido: string;
  mensagem: string;
  data_envio: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [apelido, setApelido] = useState("");
  const [isApelidoSet, setIsApelidoSet] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para gerar cor baseada no apelido
  const getColorFromApelido = (apelido: string) => {
    let hash = 0;
    for (let i = 0; i < apelido.length; i++) {
      hash = apelido.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Scroll automático para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !socketRef.current) {
      // Conectar ao WebSocket
      const socket = io(window.location.origin);
      socketRef.current = socket;

      // Requisitar histórico
      socket.emit("request_history");

      // Receber histórico
      socket.on("chat_history", (history: ChatMessage[]) => {
        setMessages(history);
        setTimeout(scrollToBottom, 100);
      });

      // Receber novas mensagens
      socket.on("new_message", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      });

      // Receber erros
      socket.on("error", (errorMsg: string) => {
        setError(errorMsg);
        setTimeout(() => setError(""), 3000);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [isOpen]);

  const handleSetApelido = () => {
    if (apelido.trim().length >= 2) {
      setIsApelidoSet(true);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      apelido,
      mensagem: inputMessage.trim(),
    });

    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isApelidoSet) {
        handleSendMessage();
      } else {
        handleSetApelido();
      }
    }
  };

  return (
    <>
      {/* Ícone flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center text-white text-2xl animate-pulse"
        title="Chat Global"
      >
        💬
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col border-2 border-pink-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="text-white font-bold">💬 Chat Global</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded px-2"
            >
              ✕
            </button>
          </div>

          {/* Conteúdo */}
          {!isApelidoSet ? (
            // Tela de escolher apelido
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
                Escolha um apelido para entrar no chat:
              </p>
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Seu apelido"
                maxLength={20}
                className="w-full px-3 py-2 border-2 border-pink-500 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSetApelido}
                disabled={apelido.trim().length < 2}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Entrar
              </button>
            </div>
          ) : (
            <>
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span
                      className="font-bold"
                      style={{ color: getColorFromApelido(msg.apelido) }}
                    >
                      {msg.apelido}:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">
                      {msg.mensagem}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Erro */}
              {error && (
                <div className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs text-center">
                  {error}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  maxLength={200}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
