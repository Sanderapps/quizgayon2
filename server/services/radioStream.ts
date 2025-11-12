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
  private publicPath: string = '';

  constructor() {
    this.findPublicPath();
    this.loadPlaylist();
  }

  private findPublicPath(): void {
    console.log(`[RÁDIO] 🔍 Procurando diretório público...`);
    console.log(`[RÁDIO] __dirname: ${__dirname}`);
    console.log(`[RÁDIO] process.cwd(): ${process.cwd()}`);

    // Lista de caminhos possíveis para tentar
    const possiblePaths = [
      path.resolve(__dirname, '../public'),
      path.resolve(process.cwd(), 'dist/public'),
      path.resolve(process.cwd(), 'public'),
      path.resolve(__dirname, '../../dist/public'),
    ];

    for (const testPath of possiblePaths) {
      console.log(`[RÁDIO] 🔍 Testando: ${testPath}`);
      if (fs.existsSync(testPath)) {
        const musicPath = path.join(testPath, 'music');
        if (fs.existsSync(musicPath)) {
          this.publicPath = testPath;
          console.log(`[RÁDIO] ✅ Diretório público encontrado: ${this.publicPath}`);
          console.log(`[RÁDIO] ✅ Diretório de música encontrado: ${musicPath}`);
          
          // Lista arquivos no diretório de música
          try {
            const files = fs.readdirSync(musicPath);
            console.log(`[RÁDIO] 📁 Arquivos em ${musicPath}:`, files);
          } catch (error) {
            console.error(`[RÁDIO] ❌ Erro ao listar arquivos:`, error);
          }
          
          return;
        } else {
          console.log(`[RÁDIO] ⚠️  Diretório existe mas não tem pasta 'music': ${testPath}`);
        }
      } else {
        console.log(`[RÁDIO] ❌ Diretório não existe: ${testPath}`);
      }
    }

    console.error(`[RÁDIO] ❌ ERRO CRÍTICO: Nenhum diretório público válido encontrado!`);
    console.error(`[RÁDIO] Caminhos testados:`, possiblePaths);
  }

  private loadPlaylist() {
    if (!this.publicPath) {
      console.error('[RÁDIO] ❌ Não é possível carregar playlist: publicPath não definido');
      return;
    }

    try {
      const playlistPath = path.join(this.publicPath, 'music', 'playlist.json');
      
      console.log(`[RÁDIO] 📋 Tentando carregar playlist de: ${playlistPath}`);
      
      if (!fs.existsSync(playlistPath)) {
        console.error(`[RÁDIO] ❌ Arquivo playlist.json não encontrado em: ${playlistPath}`);
        
        // Tenta listar o que tem no diretório
        const musicDir = path.join(this.publicPath, 'music');
        if (fs.existsSync(musicDir)) {
          const files = fs.readdirSync(musicDir);
          console.error(`[RÁDIO] 📁 Arquivos disponíveis em ${musicDir}:`, files);
        }
        
        return;
      }

      const playlistData = fs.readFileSync(playlistPath, 'utf-8');
      this.playlist = JSON.parse(playlistData);
      this.currentSongInfo.total = this.playlist.length;
      
      console.log(`[RÁDIO] ✅ Playlist carregada com sucesso!`);
      console.log(`[RÁDIO] 📊 Total de músicas: ${this.playlist.length}`);
      
      this.playlist.forEach((song, index) => {
        const songPath = path.join(this.publicPath, 'music', song.file);
        const exists = fs.existsSync(songPath);
        console.log(`[RÁDIO]   ${index + 1}. ${song.title} - ${song.artist} ${exists ? '✅' : '❌ ARQUIVO NÃO ENCONTRADO'}`);
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
      console.error('[RÁDIO] 💡 Verifique se os arquivos foram copiados corretamente durante o build.');
      console.error('[RÁDIO] 💡 Use o endpoint /api/radio/debug/files para diagnóstico.');
      return;
    }

    this.isInitialized = true;
    this.playNextSong();
    console.log('[RÁDIO] ✅ Serviço de streaming iniciado com sucesso!');
  }

  private playNextSong() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill();
    }

    if (this.currentSongIndex >= this.playlist.length) {
      this.currentSongIndex = 0;
      console.log('[RÁDIO] 🔄 Reiniciando playlist do início');
    }

    const song = this.playlist[this.currentSongIndex];
    const musicPath = path.join(this.publicPath, 'music', song.file);

    console.log(`[RÁDIO] 🎵 Tocando agora [${this.currentSongIndex + 1}/${this.playlist.length}]: ${song.title} - ${song.artist}`);

    this.currentSongInfo = {
      title: song.title,
      artist: song.artist,
      total: this.playlist.length
    };

    if (!fs.existsSync(musicPath)) {
      console.error(`[RÁDIO] ❌ Arquivo não encontrado: ${musicPath}`);
      console.error(`[RÁDIO] Pulando para a próxima música...`);
      this.currentSongIndex++;
      setTimeout(() => this.playNextSong(), 100);
      return;
    }

    try {
      this.ffmpegProcess = spawn('ffmpeg', [
        '-re',
        '-i', musicPath,
        '-f', 'mp3',
        '-'
      ]);

      this.ffmpegProcess.stdout?.on('data', (chunk: Buffer) => {
        this.listeners.forEach(res => {
          try {
            res.write(chunk);
          } catch (error) {
            // Ignora erros de escrita
          }
        });
      });

      this.ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`[RÁDIO] ✅ "${song.title}" terminou. Próxima música...`);
        } else {
          console.error(`[RÁDIO] ⚠️  FFmpeg terminou com código ${code}`);
        }
        this.currentSongIndex++;
        this.playNextSong();
      });

      this.ffmpegProcess.stderr?.on('data', (data: Buffer) => {
        // FFmpeg envia progresso para stderr
      });

      this.ffmpegProcess.on('error', (error) => {
        console.error('[RÁDIO] ❌ Erro no processo FFmpeg:', error);
        console.error('[RÁDIO] Certifique-se de que o FFmpeg está instalado.');
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

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Accept-Ranges': 'none'
    });

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

export const radioStreamService = new RadioStreamService();
