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
  const [gifCooldown, setGifCooldown] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastReadMessageIdRef = useRef<number>(0);
  const gifCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedApelido = localStorage.getItem("chat_apelido");
    const savedColor = localStorage.getItem("chat_color");
    const savedEmoji = localStorage.getItem("chat_emoji");
    if (savedApelido) { setApelido(savedApelido); setIsApelidoSet(true); }
    if (savedColor) setSelectedColor(savedColor);
    if (savedEmoji) setSelectedEmoji(savedEmoji);

    const handleToggleChat = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleChat', handleToggleChat);
    return () => window.removeEventListener('toggleChat', handleToggleChat);
  }, []);

  useEffect(() => {
    const chatButton = document.querySelector('.chat-button .chat-open-indicator');
    if (chatButton) {
      if (isOpen) chatButton.classList.remove('hidden');
      else chatButton.classList.add('hidden');
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current || isLoadingMore || !hasMore) return;
    if (messagesContainerRef.current.scrollTop < 100) loadMoreMessages();
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
      const socket = io(window.location.origin);
      socketRef.current = socket;
      socket.emit("request_history");
      socket.on("chat_history", (history: ChatMessage[]) => {
        setMessages(history);
        setTimeout(scrollToBottom, 100);
      });
      socket.on("more_history", (data: { messages: ChatMessage[], hasMore: boolean }) => {
        if (data.messages.length > 0) setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore);
        setIsLoadingMore(false);
      });
      socket.on("new_message", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
        setIsOpen((currentIsOpen) => {
          if (!currentIsOpen && message.id > lastReadMessageIdRef.current) {
            setUnreadCount((prev) => prev + 1);
          }
          return currentIsOpen;
        });
      });
      socket.on("message_deleted", (messageId: number) => {
        setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      });
      socket.on("error", (errorMsg: string) => {
        setError(errorMsg);
        setTimeout(() => setError(""), 3000);
      });
      return () => { socket.disconnect(); socketRef.current = null; };
    }
  }, [isOpen]);

  const handleSetApelido = () => {
    if (apelido.trim().length >= 2) {
      localStorage.setItem("chat_apelido", apelido.trim());
      localStorage.setItem("chat_color", selectedColor);
      localStorage.setItem("chat_emoji", selectedEmoji);
      setIsApelidoSet(true);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;
    socketRef.current.emit("chat_message", {
      apelido, mensagem: inputMessage.trim(), cor: selectedColor,
      emoji_avatar: selectedEmoji, tipo: 'text',
    });
    setInputMessage("");
    setShowEmojiPicker(false);
  };

  const handleSendGif = (gifUrl: string) => {
    if (!socketRef.current) return;
    if (gifCooldown > 0) {
      setError(`Aguarde ${gifCooldown}s para enviar outro GIF`);
      setTimeout(() => setError(""), 2000);
      return;
    }
    socketRef.current.emit("chat_message", {
      apelido, mensagem: "[GIF]", cor: selectedColor,
      emoji_avatar: selectedEmoji, tipo: 'gif', gif_url: gifUrl,
    });
    setGifCooldown(10);
    if (gifCooldownTimerRef.current) clearInterval(gifCooldownTimerRef.current);
    gifCooldownTimerRef.current = setInterval(() => {
      setGifCooldown((prev) => {
        if (prev <= 1) {
          if (gifCooldownTimerRef.current) { clearInterval(gifCooldownTimerRef.current); gifCooldownTimerRef.current = null; }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isApelidoSet) handleSendMessage();
      else handleSetApelido();
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
    if (adminPassword) socketRef.current.emit("delete_message", { messageId, adminPassword });
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
      {showGifPicker && isApelidoSet && (
        <GifPicker onSelect={handleSendGif} onClose={() => setShowGifPicker(false)} />
      )}

      {isOpen && (
        <div className="fixed inset-0 md:bottom-24 md:right-4 md:left-auto md:top-auto md:w-[400px] md:h-[580px] md:max-h-[calc(100vh-6rem)] w-full h-full dark:bg-[#0e0e1a]/98 bg-white/98 backdrop-blur-xl flex flex-col dark:border border-purple-500/20 border-gray-200" style={{ zIndex: 9998 }}>
          {/* Header */}
          <div className="p-3 flex justify-between items-center flex-shrink-0 dark:border-b border-purple-500/10 border-gray-100"
            style={{ background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-bold text-sm dark:text-white text-gray-900">Chat Global</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white">{unreadCount}</span>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="dark:text-gray-400 text-gray-500 hover:text-gray-200 rounded-lg w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors text-lg font-bold">
              ✕
            </button>
          </div>

          {/* Content */}
          {!isApelidoSet ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
              <div className="text-6xl mb-4">{selectedEmoji}</div>
              <p className="dark:text-gray-300 text-gray-600 mb-6 text-center font-medium text-sm">
                Configure seu perfil para entrar no chat
              </p>

              {/* Avatar */}
              <button onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-20 h-20 rounded-2xl dark:bg-white/5 bg-gray-50 flex items-center justify-center mb-4 hover:scale-105 transition-transform dark:border border-purple-500/20 border-gray-200 text-4xl">
                {selectedEmoji}
              </button>
              {showAvatarPicker && (
                <div className="mb-4">
                  <EmojiPicker onEmojiClick={handleAvatarEmojiClick} width={260} height={280} />
                </div>
              )}

              {/* Nickname */}
              <input type="text" value={apelido} onChange={(e) => setApelido(e.target.value)}
                onKeyPress={handleKeyPress} placeholder="Seu apelido" maxLength={20}
                className="w-full px-4 py-2.5 rounded-xl dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 dark:border-purple-500/20 border-gray-200 border-2 focus:border-purple-500 focus:outline-none transition-colors text-sm text-center mb-4" />

              {/* Color palette */}
              <div className="mb-5 w-full">
                <p className="text-[10px] dark:text-gray-500 text-gray-400 mb-2 text-center font-medium uppercase tracking-wider">Cor do nome</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? "scale-125 ring-2 ring-white dark:ring-purple-400" : "hover:scale-110"}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-5 px-4 py-2 dark:bg-white/5 bg-gray-50 rounded-xl text-center">
                <span className="text-xl">{selectedEmoji}</span>
                <span className="font-bold ml-2 text-sm" style={{ color: selectedColor }}>{apelido || "Seu nome"}</span>
              </div>

              <button onClick={handleSetApelido} disabled={apelido.trim().length < 2}
                className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)" }}>
                Entrar no Chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {isLoadingMore && (
                  <div className="text-center text-[10px] dark:text-gray-600 text-gray-400 py-2">
                    Carregando mais...
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className="text-[13px] group relative py-1 px-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-1.5">
                      <span className="text-base flex-shrink-0 mt-0.5">{msg.emoji_avatar || "😀"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs" style={{ color: msg.cor }}>{msg.apelido}:</span>{" "}
                        {msg.tipo === 'gif' && msg.gif_url ? (
                          <img src={msg.gif_url} alt="GIF" className="mt-1.5 max-w-full rounded-lg max-h-40 object-contain" loading="lazy" />
                        ) : (
                          <span className="dark:text-gray-300 text-gray-700 break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {msg.mensagem}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleReportMessage(msg.id)} className="text-xs hover:scale-110 transition-transform" title="Reportar">🚨</button>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-xs hover:scale-110 transition-transform" title="Deletar">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Error */}
              {error && (
                <div className="px-3 py-1.5 dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 text-[11px] text-center font-medium">
                  {error}
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-2 z-10">
                  <EmojiPicker onEmojiClick={handleEmojiClick} width={260} height={280} />
                </div>
              )}

              {/* Input */}
              <div className="p-2.5 dark:border-t border-purple-500/10 border-gray-100 flex gap-2 items-end">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-xl hover:scale-110 transition-transform p-1">😀</button>
                <button onClick={() => setShowGifPicker(true)} disabled={gifCooldown > 0}
                  className="text-xl hover:scale-110 transition-transform p-1 relative disabled:opacity-40 disabled:cursor-not-allowed"
                  title={gifCooldown > 0 ? `Aguarde ${gifCooldown}s` : "Enviar GIF"}>
                  🎬
                  {gifCooldown > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{gifCooldown}</span>
                  )}
                </button>
                <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress} placeholder="Digite sua mensagem..." maxLength={200} rows={1}
                  className="flex-1 px-3 py-2 rounded-xl text-[13px] dark:bg-white/5 bg-gray-50 dark:text-white text-gray-900 dark:border-purple-500/15 border-gray-200 border focus:border-purple-500 focus:outline-none resize-none dark:placeholder-gray-600 placeholder-gray-400"
                  style={{ minHeight: "38px", maxHeight: "70px" }} />
                <button onClick={handleSendMessage} disabled={!inputMessage.trim()}
                  className="px-3 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)" }}>
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
