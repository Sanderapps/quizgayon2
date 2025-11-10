import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { GifPicker } from "./GifPicker";

interface ChatMessage {
  id: number;
  apelido: string;
  mensagem: string;
  cor: string;
  emoji_avatar?: string;
  data_envio: string;
  tipo?: 'text' | 'gif';
  gif_url?: string;
}

const COLOR_PALETTE = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52B788",
  "#FF8FA3", "#6C5CE7", "#00B894", "#FDCB6E", "#E17055"
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [apelido, setApelido] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [selectedEmoji, setSelectedEmoji] = useState("😀");
  const [isApelidoSet, setIsApelidoSet] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastReadMessageIdRef = useRef<number>(0);

  // Carregar apelido salvo do LocalStorage
  useEffect(() => {
    const savedApelido = localStorage.getItem("chat_apelido");
    const savedColor = localStorage.getItem("chat_color");
    const savedEmoji = localStorage.getItem("chat_emoji");
    
    if (savedApelido) {
      setApelido(savedApelido);
      setIsApelidoSet(true);
    }
    if (savedColor) {
      setSelectedColor(savedColor);
    }
    if (savedEmoji) {
      setSelectedEmoji(savedEmoji);
    }
  }, []);

  // Scroll automático para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Detectar scroll para cima (carregar mais mensagens)
  const handleScroll = () => {
    if (!messagesContainerRef.current || isLoadingMore || !hasMore) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    if (scrollTop < 100) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = () => {
    if (!socketRef.current || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    socketRef.current.emit("request_more_history", { page: nextPage });
    setPage(nextPage);
  };

  useEffect(() => {
    if (isOpen && !socketRef.current) {
      // Conectar ao WebSocket
      const socket = io(window.location.origin);
      socketRef.current = socket;

      // Requisitar histórico inicial
      socket.emit("request_history");

      // Receber histórico
      socket.on("chat_history", (history: ChatMessage[]) => {
        setMessages(history);
        setTimeout(scrollToBottom, 100);
      });

      // Receber mais mensagens (scroll infinito)
      socket.on("more_history", (data: { messages: ChatMessage[], hasMore: boolean }) => {
        if (data.messages.length > 0) {
          setMessages((prev) => [...data.messages, ...prev]);
        }
        setHasMore(data.hasMore);
        setIsLoadingMore(false);
      });

      // Receber novas mensagens
      socket.on("new_message", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
        
        // Incrementar contador se chat estiver fechado e não for mensagem própria
        setIsOpen((currentIsOpen) => {
          if (!currentIsOpen && message.id > lastReadMessageIdRef.current) {
            setUnreadCount((prev) => prev + 1);
          }
          return currentIsOpen;
        });
      });

      // Receber mensagem deletada
      socket.on("message_deleted", (messageId: number) => {
        setMessages((prev) => prev.filter(msg => msg.id !== messageId));
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
      // Salvar no LocalStorage
      localStorage.setItem("chat_apelido", apelido.trim());
      localStorage.setItem("chat_color", selectedColor);
      localStorage.setItem("chat_emoji", selectedEmoji);
      
      setIsApelidoSet(true);
    }
  };

  const handleChangeApelido = () => {
    localStorage.removeItem("chat_apelido");
    localStorage.removeItem("chat_color");
    localStorage.removeItem("chat_emoji");
    setIsApelidoSet(false);
    setApelido("");
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      apelido,
      mensagem: inputMessage.trim(),
      cor: selectedColor,
      emoji_avatar: selectedEmoji,
      tipo: 'text',
    });

    setInputMessage("");
    setShowEmojiPicker(false);
  };

  const handleSendGif = (gifUrl: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("send_message", {
      apelido,
      mensagem: "[GIF]",
      cor: selectedColor,
      emoji_avatar: selectedEmoji,
      tipo: 'gif',
      gif_url: gifUrl,
    });
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

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleAvatarEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowAvatarPicker(false);
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!socketRef.current) return;
    
    const adminPassword = prompt("Senha de administrador:");
    if (adminPassword) {
      socketRef.current.emit("delete_message", { messageId, adminPassword });
    }
  };

  const handleReportMessage = (messageId: number) => {
    if (!socketRef.current) return;
    
    const reason = prompt("Motivo do report:");
    if (reason) {
      socketRef.current.emit("report_message", { messageId, reason });
      alert("Mensagem reportada com sucesso!");
    }
  };

  return (
    <>
      {/* Botão flutuante retangular chamativo */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Ao abrir, zera contador e salva última mensagem
            setUnreadCount(0);
            if (messages.length > 0) {
              lastReadMessageIdRef.current = messages[messages.length - 1].id;
            }
          }
        }}
        className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-white font-bold text-lg animate-gradient relative"
        title="Chat Global"
        style={{
          animation: "gradient 3s ease infinite",
          backgroundSize: "200% 200%",
          boxShadow: "0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)"
        }}
      >
        <span className="text-2xl">💬</span>
        <span>Chat</span>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* GIF Picker Modal */}
      {showGifPicker && isApelidoSet && (
        <GifPicker 
          onSelect={handleSendGif} 
          onClose={() => setShowGifPicker(false)} 
        />
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col border-2 border-pink-500">
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
            // Tela de escolher apelido, cor e emoji
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-center font-bold">
                Configure seu perfil:
              </p>
              
              {/* Avatar Emoji */}
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avatar:</p>
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="text-6xl hover:scale-110 transition-transform"
                >
                  {selectedEmoji}
                </button>
                {showAvatarPicker && (
                  <div className="mt-2">
                    <EmojiPicker onEmojiClick={handleAvatarEmojiClick} width={280} height={300} />
                  </div>
                )}
              </div>

              {/* Apelido */}
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Seu apelido"
                maxLength={20}
                className="w-full px-3 py-2 border-2 border-pink-500 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />

              {/* Paleta de cores */}
              <div className="mb-4 w-full">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">Cor do nome:</p>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor === color ? "border-black dark:border-white scale-110" : "border-gray-300"
                      } transition-transform hover:scale-110`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg w-full text-center">
                <span className="text-2xl">{selectedEmoji}</span>
                <span className="font-bold ml-2" style={{ color: selectedColor }}>
                  {apelido || "Seu nome"}
                </span>
              </div>

              <button
                onClick={handleSetApelido}
                disabled={apelido.trim().length < 2}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Entrar no Chat
              </button>
            </div>
          ) : (
            <>
              {/* Mensagens */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 space-y-2"
              >
                {isLoadingMore && (
                  <div className="text-center text-sm text-gray-500">
                    Carregando mais mensagens...
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className="text-sm group relative">
                    <div className="flex items-start gap-1 max-w-full">
                      <span className="text-lg">{msg.emoji_avatar || "😀"}</span>
                      <div className="flex-1 min-w-0 max-w-full">
                        <span
                          className="font-bold"
                          style={{ color: msg.cor }}
                        >
                          {msg.apelido}:
                        </span>{" "}
                        {msg.tipo === 'gif' && msg.gif_url ? (
                          <div className="mt-1">
                            <img 
                              src={msg.gif_url} 
                              alt="GIF" 
                              className="max-w-full rounded-lg max-h-48 object-contain"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-800 dark:text-gray-200 break-words overflow-wrap-anywhere whitespace-pre-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {msg.mensagem}
                          </span>
                        )}
                      </div>
                      {/* Botões de ação (sempre visíveis em mobile, hover em desktop) */}
                      <div className="flex md:hidden group-hover:flex gap-1">
                        <button
                          onClick={() => handleReportMessage(msg.id)}
                          className="text-sm text-red-500 hover:text-red-700 active:scale-90 transition-transform p-1"
                          title="Reportar"
                        >
                          🚨
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-sm text-gray-500 hover:text-gray-700 active:scale-90 transition-transform p-1"
                          title="Deletar (admin)"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
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

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-0 z-10">
                  <EmojiPicker onEmojiClick={handleEmojiClick} width={280} height={300} />
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-2xl hover:scale-110 transition-transform"
                  title="Adicionar emoji"
                >
                  😀
                </button>
                <button
                  onClick={() => setShowGifPicker(true)}
                  className="text-2xl hover:scale-110 transition-transform"
                  title="Enviar GIF"
                >
                  🎬
                </button>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  maxLength={200}
                  rows={1}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white resize-none"
                  style={{ minHeight: "40px", maxHeight: "80px" }}
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
