import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { GifPicker } from "./GifPicker";
import { quizAudio } from "@/lib/quizAudio";
import { Flag, MessageSquare, Palette, Send, SmilePlus, Sticker, Trash2, UserRound, X } from "lucide-react";

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

    const handleToggleChat = () => {
      setIsOpen((prev) => {
        const nextOpen = !prev;
        if (nextOpen) quizAudio.playPanelOpen();
        else quizAudio.playPanelClose();
        return nextOpen;
      });
    };
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
      quizAudio.playConfirm();
      localStorage.setItem("chat_apelido", apelido.trim());
      localStorage.setItem("chat_color", selectedColor);
      localStorage.setItem("chat_emoji", selectedEmoji);
      setIsApelidoSet(true);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;
    quizAudio.playSubmit();
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
    quizAudio.playSubmit();
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
        <div className="fixed inset-0 z-[9998] flex h-full w-full flex-col overflow-hidden border border-slate-200 bg-white/98 backdrop-blur-xl md:bottom-24 md:left-auto md:right-4 md:top-auto md:h-[580px] md:max-h-[calc(100vh-6rem)] md:w-[400px] md:rounded-[28px] dark:border-purple-500/20 dark:bg-[#0e0e1a]/98">
          {/* Header */}
          <div
            className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 p-3 dark:border-purple-500/10"
            style={{ background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)" }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-500/20 bg-white/70 text-purple-500 dark:bg-white/5 dark:text-cyan-300">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Chat ao vivo</h3>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Comentários rápidos da arena</p>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-purple-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount}</span>
              )}
            </div>
            <button
              onClick={() => {
                quizAudio.playPanelClose();
                setIsOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/40 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
              aria-label="Fechar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          {!isApelidoSet ? (
            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] border border-slate-200 bg-white/75 text-4xl dark:border-purple-500/15 dark:bg-white/5">
                {selectedEmoji}
              </div>
              <p className="mb-6 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                Defina um apelido e um avatar rápido para entrar na conversa.
              </p>

              {/* Avatar */}
              <button
                onClick={() => {
                  quizAudio.playSoftToggle();
                  setShowAvatarPicker(!showAvatarPicker);
                }}
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-4xl transition-transform hover:scale-105 dark:border-purple-500/20 dark:bg-white/5"
                aria-label="Escolher avatar"
              >
                {selectedEmoji}
              </button>
              {showAvatarPicker && (
                <div className="mb-4">
                  <EmojiPicker onEmojiClick={handleAvatarEmojiClick} width={260} height={280} />
                </div>
              )}

              {/* Nickname */}
              <div className="relative mb-4 w-full">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Seu apelido"
                  maxLength={20}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-center text-sm text-gray-900 transition-colors focus:border-purple-500 focus:outline-none dark:border-purple-500/20 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Color palette */}
              <div className="mb-5 w-full">
                <p className="mb-2 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  <Palette className="h-3 w-3" />
                  Cor do nome
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        if (selectedColor !== color) {
                          quizAudio.playSoftToggle();
                        }
                        setSelectedColor(color);
                      }}
                      className={`h-8 w-8 rounded-full transition-all ${selectedColor === color ? "scale-125 ring-2 ring-white dark:ring-purple-400" : "hover:scale-110"}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Escolher cor ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-5 rounded-xl bg-gray-50 px-4 py-2 text-center dark:bg-white/5">
                <span className="text-xl">{selectedEmoji}</span>
                <span className="font-bold ml-2 text-sm" style={{ color: selectedColor }}>{apelido || "Seu nome"}</span>
              </div>

              <button
                onClick={handleSetApelido}
                disabled={apelido.trim().length < 2}
                className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)" }}
              >
                Entrar no chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 space-y-2 overflow-y-auto p-3">
                {isLoadingMore && (
                  <div className="py-2 text-center text-[10px] text-gray-400 dark:text-gray-600">
                    Carregando mais...
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className="group relative rounded-xl border border-transparent bg-black/[0.015] px-2.5 py-2 text-[13px] transition-colors hover:border-white/8 hover:bg-white/40 dark:bg-white/[0.02] dark:hover:bg-white/5">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 text-base dark:bg-white/5">
                        {msg.emoji_avatar || "😀"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold" style={{ color: msg.cor }}>{msg.apelido}</span>{" "}
                        {msg.tipo === 'gif' && msg.gif_url ? (
                          <img src={msg.gif_url} alt="GIF" className="mt-1.5 max-w-full rounded-lg max-h-40 object-contain" loading="lazy" />
                        ) : (
                          <span className="break-words text-gray-700 dark:text-gray-300" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {msg.mensagem}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleReportMessage(msg.id)}
                          className="rounded-lg p-1 text-amber-500 transition-colors hover:bg-amber-500/10"
                          title="Reportar"
                          aria-label="Reportar mensagem"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="rounded-lg p-1 text-rose-500 transition-colors hover:bg-rose-500/10"
                          title="Deletar"
                          aria-label="Deletar mensagem"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Error */}
              {error && (
                <div className="px-3 py-1.5 text-center text-[11px] font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400">
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
              <div className="flex items-end gap-2 border-t border-gray-100 p-2.5 dark:border-purple-500/10">
                <button
                  onClick={() => {
                    quizAudio.playSoftToggle();
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  aria-label="Abrir emojis"
                >
                  <SmilePlus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    quizAudio.playPanelOpen();
                    setShowGifPicker(true);
                  }}
                  disabled={gifCooldown > 0}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  title={gifCooldown > 0 ? `Aguarde ${gifCooldown}s` : "Enviar GIF"}
                  aria-label="Abrir GIFs"
                >
                  <Sticker className="h-4 w-4" />
                  {gifCooldown > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">{gifCooldown}</span>
                  )}
                </button>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escreva uma mensagem"
                  maxLength={200}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none dark:border-purple-500/15 dark:bg-white/5 dark:text-white dark:placeholder-gray-600"
                  style={{ minHeight: "40px", maxHeight: "72px" }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)" }}
                  aria-label="Enviar mensagem"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
