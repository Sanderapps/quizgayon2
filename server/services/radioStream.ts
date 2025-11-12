import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Song {
  file: string;
  title: string;
  artist: string;
}

interface CurrentSongInfo {
  title: string;
  artist: string;
  total: number;
}

class RadioStreamService {
  private listeners: Response[] = [];
  private ffmpegProcess: ChildProcess | null = null;
  private playlist: Song[] = [];
  private currentSongIndex: number = 0;
  private currentSongInfo: CurrentSongInfo = {
    title: 'Rádio Offline',
    artist: 'Aguarde...',
    total: 0
  };
  private isInitialized: boolean = false;
  private publicPath: string;

  constructor() {
    // Determina o caminho correto baseado no ambiente
    // Em produção: dist/public
    // O __dirname aqui será dist/services após o build
    this.publicPath = path.resolve(__dirname, '../public');
    
    console.log(`[RÁDIO] Caminho público configurado: ${this.publicPath}`);
    this.loadPlaylist();
  }

  private loadPlaylist() {
    try {
      const playlistPath = path.join(this.publicPath, 'music', 'playlist.json');
      
      console.log(`[RÁDIO] Tentando carregar playlist de: ${playlistPath}`);
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(playlistPath)) {
        console.error(`[RÁDIO] ❌ Playlist não encontrada em: ${playlistPath}`);
        console.error(`[RÁDIO] Verifique se os arquivos foram copiados corretamente durante o build.`);
        return;
      }

      const playlistData = fs.readFileSync(playlistPath, 'utf-8');
      this.playlist = JSON.parse(playlistData);
      this.currentSongInfo.total = this.playlist.length;
      
      console.log(`[RÁDIO] ✅ Playlist carregada com sucesso: ${this.playlist.length} músicas`);
      
      // Lista as músicas carregadas
      this.playlist.forEach((song, index) => {
        console.log(`[RÁDIO]   ${index + 1}. ${song.title} - ${song.artist}`);
      });
      
    } catch (error) {
      console.error('[RÁDIO] ❌ Erro ao carregar playlist:', error);
    }
  }

  public start() {
    if (this.isInitialized) {
      console.log('[RÁDIO] ⚠️  Serviço já está rodando');
      return;
    }

    if (this.playlist.length === 0) {
      console.error('[RÁDIO] ❌ Não é possível iniciar: playlist vazia');
      console.error('[RÁDIO] Verifique se o arquivo playlist.json existe e contém músicas.');
      return;
    }

    this.isInitialized = true;
    this.playNextSong();
    console.log('[RÁDIO] ✅ Serviço de streaming iniciado');
  }

  private playNextSong() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill();
    }

    if (this.currentSongIndex >= this.playlist.length) {
      this.currentSongIndex = 0; // Loop infinito
      console.log('[RÁDIO] 🔄 Reiniciando playlist do início');
    }

    const song = this.playlist[this.currentSongIndex];
    const musicPath = path.join(this.publicPath, 'music', song.file);

    console.log(`[RÁDIO] 🎵 Tocando agora: ${song.title} - ${song.artist}`);

    // Atualiza informações da música atual
    this.currentSongInfo = {
      title: song.title,
      artist: song.artist,
      total: this.playlist.length
    };

    // Verifica se o arquivo existe
    if (!fs.existsSync(musicPath)) {
      console.error(`[RÁDIO] ❌ Arquivo não encontrado: ${musicPath}`);
      console.error(`[RÁDIO] Pulando para a próxima música...`);
      this.currentSongIndex++;
      setTimeout(() => this.playNextSong(), 100);
      return;
    }

    // Verifica se FFmpeg está disponível
    try {
      // Inicia o FFmpeg para streaming
      this.ffmpegProcess = spawn('ffmpeg', [
        '-re',              // Lê na velocidade nativa (tempo real)
        '-i', musicPath,    // Arquivo de entrada
        '-f', 'mp3',        // Formato de saída
        '-'                 // Saída para stdout
      ]);

      // Distribui o áudio para todos os ouvintes
      this.ffmpegProcess.stdout?.on('data', (chunk: Buffer) => {
        this.listeners.forEach(res => {
          try {
            res.write(chunk);
          } catch (error) {
            // Ignora erros de escrita (conexão fechada)
          }
        });
      });

      // Quando a música termina, toca a próxima
      this.ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`[RÁDIO] ✅ "${song.title}" terminou. Próxima música...`);
        } else {
          console.error(`[RÁDIO] ⚠️  FFmpeg terminou com código ${code}`);
        }
        this.currentSongIndex++;
        this.playNextSong();
      });

      // Log de erros do FFmpeg
      this.ffmpegProcess.stderr?.on('data', (data: Buffer) => {
        // FFmpeg envia informações de progresso para stderr
        // Descomente para debug detalhado:
        // console.log(`[FFMPEG]: ${data.toString()}`);
      });

      this.ffmpegProcess.on('error', (error) => {
        console.error('[RÁDIO] ❌ Erro no processo FFmpeg:', error);
        console.error('[RÁDIO] Certifique-se de que o FFmpeg está instalado no sistema.');
      });
      
    } catch (error) {
      console.error('[RÁDIO] ❌ Erro ao iniciar FFmpeg:', error);
      this.currentSongIndex++;
      setTimeout(() => this.playNextSong(), 1000);
    }
  }

  public addListener(res: Response): void {
    console.log(`[RÁDIO] 👤 Novo ouvinte conectado. Total: ${this.listeners.length + 1}`);
    this.listeners.push(res);

    // Configura cabeçalhos para streaming
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Accept-Ranges': 'none'
    });

    // Remove o ouvinte quando a conexão é fechada
    res.on('close', () => {
      const index = this.listeners.indexOf(res);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
      console.log(`[RÁDIO] 👋 Ouvinte desconectado. Total: ${this.listeners.length}`);
    });
  }

  public getCurrentSongInfo(): CurrentSongInfo {
    return this.currentSongInfo;
  }

  public getListenerCount(): number {
    return this.listeners.length;
  }
}

// Singleton
export const radioStreamService = new RadioStreamService();
