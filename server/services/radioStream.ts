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

  constructor() {
    this.loadPlaylist();
  }

  private loadPlaylist() {
    try {
      const playlistPath = path.resolve(__dirname, '../../dist/public/music/playlist.json');
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(playlistPath)) {
        console.warn(`[RÁDIO] Playlist não encontrada em: ${playlistPath}`);
        return;
      }

      const playlistData = fs.readFileSync(playlistPath, 'utf-8');
      this.playlist = JSON.parse(playlistData);
      this.currentSongInfo.total = this.playlist.length;
      
      console.log(`[RÁDIO] Playlist carregada com ${this.playlist.length} músicas`);
    } catch (error) {
      console.error('[RÁDIO] Erro ao carregar playlist:', error);
    }
  }

  public start() {
    if (this.isInitialized) {
      console.log('[RÁDIO] Serviço já está rodando');
      return;
    }

    if (this.playlist.length === 0) {
      console.warn('[RÁDIO] Não é possível iniciar: playlist vazia');
      return;
    }

    this.isInitialized = true;
    this.playNextSong();
    console.log('[RÁDIO] Serviço de streaming iniciado');
  }

  private playNextSong() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill();
    }

    if (this.currentSongIndex >= this.playlist.length) {
      this.currentSongIndex = 0; // Loop infinito
    }

    const song = this.playlist[this.currentSongIndex];
    const musicPath = path.resolve(__dirname, '../../dist/public/music', song.file);

    console.log(`[RÁDIO] Tocando agora: ${song.title} - ${song.artist}`);

    // Atualiza informações da música atual
    this.currentSongInfo = {
      title: song.title,
      artist: song.artist,
      total: this.playlist.length
    };

    // Verifica se o arquivo existe
    if (!fs.existsSync(musicPath)) {
      console.error(`[RÁDIO] Arquivo não encontrado: ${musicPath}. Pulando...`);
      this.currentSongIndex++;
      setTimeout(() => this.playNextSong(), 100);
      return;
    }

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
          console.error('[RÁDIO] Erro ao enviar chunk para ouvinte:', error);
        }
      });
    });

    // Quando a música termina, toca a próxima
    this.ffmpegProcess.on('close', () => {
      console.log(`[RÁDIO] "${song.title}" terminou. Próxima música...`);
      this.currentSongIndex++;
      this.playNextSong();
    });

    // Log de erros do FFmpeg (stderr contém informações de progresso)
    this.ffmpegProcess.stderr?.on('data', (data: Buffer) => {
      // Descomente para debug:
      // console.log(`[FFMPEG]: ${data.toString()}`);
    });

    this.ffmpegProcess.on('error', (error) => {
      console.error('[RÁDIO] Erro no processo FFmpeg:', error);
    });
  }

  public addListener(res: Response): void {
    console.log(`[RÁDIO] Novo ouvinte conectado. Total: ${this.listeners.length + 1}`);
    this.listeners.push(res);

    // Configura cabeçalhos para streaming
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*'
    });

    // Remove o ouvinte quando a conexão é fechada
    res.on('close', () => {
      const index = this.listeners.indexOf(res);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
      console.log(`[RÁDIO] Ouvinte desconectado. Total: ${this.listeners.length}`);
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
