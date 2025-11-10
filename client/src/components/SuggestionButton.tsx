import { useState } from "react";

export const SuggestionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [apelido, setApelido] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async () => {
    if (!message.trim() || !apelido.trim()) {
      setFeedback({ type: 'error', text: 'Preencha todos os campos!' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apelido: apelido.trim(),
          mensagem: message.trim(),
        }),
      });

      if (response.ok) {
        setFeedback({ type: 'success', text: 'Sugestão enviada com sucesso! Obrigado! 💖' });
        setMessage("");
        setApelido("");
        setTimeout(() => {
          setIsOpen(false);
          setFeedback(null);
        }, 2000);
      } else {
        const error = await response.json();
        setFeedback({ type: 'error', text: error.error || 'Erro ao enviar sugestão' });
      }
    } catch (error) {
      setFeedback({ type: 'error', text: 'Erro de conexão. Tente novamente!' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl shadow-lg active:scale-95"
        aria-label="Enviar sugestão"
        title="Enviar sugestão ou feedback"
      >
        <span className="transition-transform duration-300 hover:rotate-12">💡</span>
      </button>

      {/* Dialog/Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span>💡</span>
                <span>Sugestões</span>
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Descrição */}
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Tem alguma ideia para melhorar o quiz? Manda pra gente! 🌈
            </p>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seu nome/apelido
                </label>
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  maxLength={30}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sua sugestão
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escreva sua sugestão ou feedback aqui... (Ctrl+Enter para enviar)"
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors resize-none"
                  disabled={isSubmitting}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                  {message.length}/500
                </div>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                feedback.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}>
                {feedback.text}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !message.trim() || !apelido.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar 💖'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animação CSS */}
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
