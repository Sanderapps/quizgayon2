import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  position: number; // Posição atual em segundos
  duration: number; // Duração total em segundos
}

class RadioStreamSimpleService {
  private playlist: Song[] = [];
  private currentSongIndex = 0;
  private startTime: number = Date.now();
  private publicPath: string = '';
  private currentSongInfo: CurrentSongInfo = {
    title: 'Rádio Offline',
    artist: 'Aguarde...',
    total: 0,
    position: 0,
    duration: 0
  };

  constructor() {
    this.findPublicPath();
    this.loadPlaylist();
  }

  private findPublicPath() {
    const possiblePaths = [
      path.resolve(__dirname, './public'),
      path.resolve(__dirname, '../public'),
      path.resolve(process.cwd(), 'dist/public'),
      path.resolve(process.cwd(), 'public'),
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        this.publicPath = testPath;
        console.log(`[RÁDIO SIMPLES] ✅ Diretório público encontrado: ${this.publicPath}`);
        return;
      }
    }

    console.error('[RÁDIO SIMPLES] ❌ Diretório público não encontrado!');
  }

  private loadPlaylist() {
    try {
      const playlistPath = path.join(this.publicPath, 'music', 'playlist.json');
      
      if (!fs.existsSync(playlistPath)) {
        console.error(`[RÁDIO SIMPLES] ❌ Playlist não encontrada: ${playlistPath}`);
        return;
      }

      const playlistData = fs.readFileSync(playlistPath, 'utf-8');
      this.playlist = JSON.parse(playlistData);
      this.currentSongInfo.total = this.playlist.length;
      
      console.log(`[RÁDIO SIMPLES] ✅ Playlist carregada: ${this.playlist.length} músicas`);
      
      // Inicia o loop de atualização
      this.updateCurrentSong();
      setInterval(() => this.updateCurrentSong(), 1000); // Atualiza a cada segundo
      
    } catch (error) {
      console.error('[RÁDIO SIMPLES] ❌ Erro ao carregar playlist:', error);
    }
  }

  private async getMp3Duration(filePath: string): Promise<number> {
    try {
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      
      // Estimativa aproximada: MP3 128kbps = 16KB/s
      // Duração = tamanho / (bitrate / 8)
      const bitrateKbps = 128;
      const bytesPerSecond = (bitrateKbps * 1000) / 8;
      const durationSeconds = fileSizeInBytes / bytesPerSecond;
      
      return Math.floor(durationSeconds);
    } catch (error) {
      console.error('[RÁDIO SIMPLES] ❌ Erro ao calcular duração:', error);
      return 180; // 3 minutos como fallback
    }
  }

  private async updateCurrentSong() {
    if (this.playlist.length === 0) return;

    const song = this.playlist[this.currentSongIndex];
    const songPath = path.join(this.publicPath, 'music', song.file);
    
    if (!fs.existsSync(songPath)) {
      console.error(`[RÁDIO SIMPLES] ❌ Arquivo não encontrado: ${songPath}`);
      this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
      return;
    }

    const duration = await this.getMp3Duration(songPath);
    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const position = elapsedSeconds % duration;

    // Se a música terminou, avança para a próxima
    if (position === 0 && elapsedSeconds > 0) {
      this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
      this.startTime = Date.now();
      console.log(`[RÁDIO SIMPLES] 🎵 Próxima música: ${this.playlist[this.currentSongIndex].title}`);
    }

    this.currentSongInfo = {
      title: song.title,
      artist: song.artist,
      total: this.playlist.length,
      position,
      duration
    };
  }

  public getCurrentSongInfo(): CurrentSongInfo {
    return this.currentSongInfo;
  }

  // Métodos de controle para o painel de admin
  public skipToNext(): void {
    this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
    this.startTime = Date.now();
    console.log(`[RÁDIO ADMIN] ⏭️ Pulando para: ${this.playlist[this.currentSongIndex].title}`);
  }

  public restart(): void {
    this.currentSongIndex = 0;
    this.startTime = Date.now();
    console.log('[RÁDIO ADMIN] 🔄 Rein iciando playlist');
  }

  public getPlaylist(): Song[] {
    return this.playlist;
  }

  public playSpecificSong(index: number): void {
    if (index >= 0 && index < this.playlist.length) {
      this.currentSongIndex = index;
      this.startTime = Date.now();
      console.log(`[RÁDIO ADMIN] ▶️ Tocando: ${this.playlist[index].title}`);
    }
  }

  public async streamCurrentSong(res: Response): Promise<void> {
    if (this.playlist.length === 0) {
      res.status(503).json({ error: 'Playlist vazia' });
      return;
    }

    const song = this.playlist[this.currentSongIndex];
    const songPath = path.join(this.publicPath, 'music', song.file);

    if (!fs.existsSync(songPath)) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    const stat = fs.statSync(songPath);
    const fileSize = stat.size;
    const duration = await this.getMp3Duration(songPath);
    
    // Calcula o offset baseado na posição atual
    const position = this.currentSongInfo.position;
    const bytesPerSecond = fileSize / duration;
    const startByte = Math.floor(position * bytesPerSecond);

    console.log(`[RÁDIO SIMPLES] 🎧 Novo ouvinte - Posição: ${position}s/${duration}s (byte ${startByte}/${fileSize})`);

    // Headers para streaming com range
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': fileSize - startByte,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'icy-name': 'QuiZoeira Radio',
      'icy-genre': 'Various'
    });

    // Cria stream a partir do offset calculado
    const stream = fs.createReadStream(songPath, { start: startByte });
    stream.pipe(res);

    stream.on('error', (error) => {
      console.error('[RÁDIO SIMPLES] ❌ Erro no stream:', error);
      res.end();
    });

    res.on('close', () => {
      stream.destroy();
      console.log('[RÁDIO SIMPLES] 👋 Ouvinte desconectado');
    });
  }
}

export const radioStreamSimpleService = new RadioStreamSimpleService();
