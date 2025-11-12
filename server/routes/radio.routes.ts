import { Router, Request, Response } from 'express';
import { radioStreamSimpleService } from '../services/radioStreamSimple.js';

const router = Router();

// Endpoint de streaming de áudio
router.get('/stream', async (req: Request, res: Response) => {
  await radioStreamSimpleService.streamCurrentSong(res);
});

// Endpoint para obter informações da música atual
router.get('/nowplaying', (req: Request, res: Response) => {
  const info = radioStreamSimpleService.getCurrentSongInfo();
  res.json(info);
});

// Endpoint para obter estatísticas da rádio
router.get('/stats', (req: Request, res: Response) => {
  const info = radioStreamSimpleService.getCurrentSongInfo();
  const listeners = 0; // Não rastreamos mais ouvintes individuais
  
  res.json({
    currentSong: {
      title: info.title,
      artist: info.artist
    },
    totalSongs: info.total,
    listeners: listeners
  });
});

// Endpoint de health check para diagnóstico
router.get('/health', (req: Request, res: Response) => {
  const info = radioStreamService.getCurrentSongInfo();
  const isOnline = info.title !== 'Rádio Offline';
  
  res.json({
    status: isOnline ? 'online' : 'offline',
    currentSong: info,
    listeners: radioStreamService.getListenerCount(),
    message: isOnline ? 'Rádio funcionando normalmente' : 'Rádio não iniciada - verifique os logs do servidor'
  });
});

// Endpoint de diagnóstico de sistema de arquivos
router.get('/debug/files', async (req: Request, res: Response) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const debug: any = {
      __dirname: __dirname,
      cwd: process.cwd(),
      paths: {}
    };
    
    // Tenta vários caminhos possíveis
    const pathsToCheck = [
      path.resolve(__dirname, '../public'),
      path.resolve(__dirname, '../public/music'),
      path.resolve(__dirname, '../../dist/public'),
      path.resolve(__dirname, '../../dist/public/music'),
      path.resolve(process.cwd(), 'dist/public'),
      path.resolve(process.cwd(), 'dist/public/music'),
      path.resolve(process.cwd(), 'public'),
      path.resolve(process.cwd(), 'public/music')
    ];
    
    pathsToCheck.forEach(p => {
      try {
        const exists = fs.existsSync(p);
        debug.paths[p] = {
          exists,
          files: exists ? fs.readdirSync(p) : null
        };
      } catch (error: any) {
        debug.paths[p] = { error: error.message };
      }
    });
    
    res.json(debug);
  } catch (error: any) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

export default router;
