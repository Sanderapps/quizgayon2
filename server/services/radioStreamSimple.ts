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
  private durationCache = new Map<string, number>();
  private currentSongInfo: CurrentSongInfo = {
    title: 'Rádio Offline',
    artist: 'Aguarde...',
    total: 0,
    position: 0,
    duration: 0
  };
  private io: any = null;

  public setSocketIO(io: any): void {
    this.io = io;
    console.log('[RÁDIO] Socket.IO conectado para sincronização');
  }

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

  private readMp3Bitrate(filePath: string): number | null {
    try {
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(32768);
      const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);

      const bitrateTable: Record<string, number[]> = {
        V1L3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
        V2L3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
      };

      for (let offset = 0; offset < bytesRead - 4; offset++) {
        if (buffer[offset] !== 0xff || (buffer[offset + 1] & 0xe0) !== 0xe0) {
          continue;
        }

        const versionBits = (buffer[offset + 1] >> 3) & 0x03;
        const layerBits = (buffer[offset + 1] >> 1) & 0x03;
        const bitrateIndex = (buffer[offset + 2] >> 4) & 0x0f;

        const isMpeg1 = versionBits === 0x03;
        const isLayer3 = layerBits === 0x01;

        if (!isLayer3 || bitrateIndex === 0 || bitrateIndex === 0x0f) {
          continue;
        }

        const tableKey = isMpeg1 ? 'V1L3' : 'V2L3';
        const bitrate = bitrateTable[tableKey][bitrateIndex];
        if (bitrate > 0) {
          return bitrate * 1000;
        }
      }

      return null;
    } catch (error) {
      console.error('[RÁDIO SIMPLES] ❌ Erro ao ler bitrate MP3:', error);
      return null;
    }
  }

  private getMp3Duration(filePath: string): number {
    const cachedDuration = this.durationCache.get(filePath);
    if (cachedDuration) {
      return cachedDuration;
    }

    try {
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      const bitrate = this.readMp3Bitrate(filePath) || 128000;
      const durationSeconds = Math.max(1, Math.floor((fileSizeInBytes * 8) / bitrate));
      this.durationCache.set(filePath, durationSeconds);
      return durationSeconds;
    } catch (error) {
      console.error('[RÁDIO SIMPLES] ❌ Erro ao calcular duração:', error);
      return 180;
    }
  }

  private buildSongInfo(songIndex: number, position: number): CurrentSongInfo {
    const song = this.playlist[songIndex];
    const songPath = path.join(this.publicPath, 'music', song.file);
    const duration = fs.existsSync(songPath) ? this.getMp3Duration(songPath) : 0;

    return {
      title: song.title,
      artist: song.artist,
      total: this.playlist.length,
      position: Math.max(0, Math.min(position, Math.max(duration - 1, 0))),
      duration,
    };
  }

  private updateCurrentSong() {
    if (this.playlist.length === 0) return;

    let elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    let songIndex = this.currentSongIndex;
    let song = this.playlist[songIndex];
    let songPath = path.join(this.publicPath, 'music', song.file);
    let duration = 0;
    let advanced = false;

    for (let guard = 0; guard < this.playlist.length; guard++) {
      if (!fs.existsSync(songPath)) {
        console.error(`[RÁDIO SIMPLES] ❌ Arquivo não encontrado: ${songPath}`);
        songIndex = (songIndex + 1) % this.playlist.length;
        song = this.playlist[songIndex];
        songPath = path.join(this.publicPath, 'music', song.file);
        advanced = true;
        continue;
      }

      duration = this.getMp3Duration(songPath);
      if (elapsedSeconds < duration) {
        break;
      }

      elapsedSeconds -= duration;
      songIndex = (songIndex + 1) % this.playlist.length;
      song = this.playlist[songIndex];
      songPath = path.join(this.publicPath, 'music', song.file);
      advanced = true;
    }

    if (advanced) {
      this.currentSongIndex = songIndex;
      this.startTime = Date.now() - (elapsedSeconds * 1000);
      console.log(`[RÁDIO SIMPLES] 🎵 Próxima música: ${this.playlist[this.currentSongIndex].title}`);
    }

    this.currentSongInfo = this.buildSongInfo(songIndex, elapsedSeconds);
  }

  public getCurrentSongInfo(): CurrentSongInfo {
    return this.currentSongInfo;
  }

  // Métodos de controle para o painel de admin
  public skipToNext(): void {
    this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
    this.startTime = Date.now();
    this.currentSongInfo = this.buildSongInfo(this.currentSongIndex, 0);
    console.log(`[RÁDIO ADMIN] ⏭️ Pulando para: ${this.playlist[this.currentSongIndex].title}`);
    this.notifyListeners();
  }

  public restart(): void {
    this.currentSongIndex = 0;
    this.startTime = Date.now();
    this.currentSongInfo = this.buildSongInfo(this.currentSongIndex, 0);
    console.log('[RÁDIO ADMIN] 🔄 Reiniciando playlist');
    this.notifyListeners();
  }

  public getPlaylist(): Song[] {
    return this.playlist;
  }

  public playSpecificSong(index: number): void {
    if (index >= 0 && index < this.playlist.length) {
      this.currentSongIndex = index;
      this.startTime = Date.now();
      this.currentSongInfo = this.buildSongInfo(this.currentSongIndex, 0);
      console.log(`[RÁDIO ADMIN] ▶️ Tocando: ${this.playlist[index].title}`);
      this.notifyListeners();
    }
  }

  public getUpcomingSongs(limit: number = 5): Song[] {
    if (this.playlist.length === 0) return [];

    const queue: Song[] = [];
    for (let offset = 1; offset <= Math.min(limit, this.playlist.length - 1); offset++) {
      const index = (this.currentSongIndex + offset) % this.playlist.length;
      queue.push(this.playlist[index]);
    }

    return queue;
  }

  private notifyListeners(): void {
    if (this.io) {
      this.io.emit('radio:songChanged', {
        song: this.currentSongInfo,
        timestamp: Date.now()
      });
      console.log('[RÁDIO] 📡 Notificação enviada aos ouvintes');
    }
  }

  public async streamCurrentSong(res: Response): Promise<void> {
    if (this.playlist.length === 0) {
      res.status(503).json({ error: 'Playlist vazia' });
      return;
    }

    this.updateCurrentSong();

    if (this.currentSongInfo.duration > 0 && this.currentSongInfo.position >= this.currentSongInfo.duration - 1) {
      this.skipToNext();
    }

    const song = this.playlist[this.currentSongIndex];
    const songPath = path.join(this.publicPath, 'music', song.file);

    if (!fs.existsSync(songPath)) {
      res.status(404).json({ error: 'Arquivo não encontrado' });
      return;
    }

    const stat = fs.statSync(songPath);
    const fileSize = stat.size;
    const duration = this.getMp3Duration(songPath);
    
    // Calcula o offset baseado na posição atual
    const position = this.currentSongInfo.position;
    const bytesPerSecond = duration > 0 ? fileSize / duration : fileSize;
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
