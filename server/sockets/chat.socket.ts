import { Server, Socket } from "socket.io";
import { 
  getRecentMessages, 
  saveMessage, 
  deleteMessage, 
  saveReport, 
  countUniqueReports,
  filterBadWords 
} from "../services/chatService.js";
import { isValidAdminPassword } from "../auth/adminAuth.js";

// Map para rastrear última mensagem de cada usuário (cooldown)
const userLastMessage = new Map<string, number>();
const MESSAGE_COOLDOWN_MS = 2000; // 2 segundos

/**
 * Configura os eventos do Socket.IO para o chat
 */
export function setupChatSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("🟢 Novo usuário conectado:", socket.id);

    // Enviar mensagens recentes ao conectar
    getRecentMessages(50).then(messages => {
      socket.emit("chat_history", messages);
    }).catch(error => {
      console.error("Erro ao buscar histórico:", error);
    });

    // Receber nova mensagem
    socket.on("chat_message", async (data: { 
      apelido: string; 
      mensagem: string; 
      cor: string; 
      emoji_avatar: string; 
      tipo: string; 
      gif_url?: string 
    }) => {
      try {
        // Cooldown de mensagens
        const lastMessageTime = userLastMessage.get(socket.id) || 0;
        const now = Date.now();
        
        if (now - lastMessageTime < MESSAGE_COOLDOWN_MS) {
          socket.emit("error", "Aguarde um pouco antes de enviar outra mensagem");
          return;
        }

        userLastMessage.set(socket.id, now);

        // Filtrar palavrões
        const filteredMessage = filterBadWords(data.mensagem);

        // Salvar mensagem no banco
        const newMessage = await saveMessage({
          apelido: data.apelido,
          mensagem: filteredMessage,
          cor: data.cor,
          emoji_avatar: data.emoji_avatar,
          tipo: data.tipo,
          gif_url: data.gif_url
        });

        // Broadcast para todos os clientes
        io.emit("new_message", newMessage);

        console.log(`💬 ${data.apelido}: ${filteredMessage.substring(0, 50)}...`);
      } catch (error) {
        console.error("❌ Erro ao processar mensagem:", error);
        socket.emit("error", "Erro ao enviar mensagem");
      }
    });

    // Deletar mensagem (admin)
    socket.on("delete_message", async (data: { messageId: number; adminPassword: string }) => {
      try {
        const { messageId, adminPassword } = data;

        // Verificar senha de admin
        if (!isValidAdminPassword(adminPassword)) {
          socket.emit("error", "Senha de administrador incorreta");
          return;
        }

        // Deletar mensagem
        await deleteMessage(messageId);

        // Notificar todos os clientes
        io.emit("message_deleted", messageId);

        console.log(`🗑️ Mensagem ${messageId} deletada por admin`);
      } catch (error) {
        console.error("❌ Erro ao deletar mensagem:", error);
        socket.emit("error", "Erro ao deletar mensagem");
      }
    });

    // Reportar mensagem
    socket.on("report_message", async (data: { messageId: number; reason: string }) => {
      try {
        const { messageId, reason } = data;

        // Salvar report no banco
        await saveReport(messageId, reason, socket.id);

        console.log(`🚨 Mensagem ${messageId} reportada: ${reason}`);

        // AUTO-MODERAÇÃO: Verificar quantos reports únicos a mensagem tem
        const uniqueReports = await countUniqueReports(messageId);

        // Se 3 ou mais pessoas diferentes reportaram, deletar automaticamente
        if (uniqueReports >= 3) {
          await deleteMessage(messageId);

          // Notificar todos os clientes
          io.emit("message_deleted", messageId);

          console.log(`🛡️ AUTO-MODERAÇÃO: Mensagem ${messageId} deletada automaticamente (${uniqueReports} reports)`);
        }
      } catch (error) {
        console.error("❌ Erro ao reportar mensagem:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Usuário desconectado:", socket.id);
      userLastMessage.delete(socket.id);
    });
  });
}
