import { Router, Request, Response } from 'express';
import { radioStreamService } from '../services/radioStream.js';

const router = Router();

// Endpoint de streaming de áudio
router.get('/stream', (req: Request, res: Response) => {
  radioStreamService.addListener(res);
});

// Endpoint para obter informações da música atual
router.get('/nowplaying', (req: Request, res: Response) => {
  const info = radioStreamService.getCurrentSongInfo();
  res.json(info);
});

// Endpoint para obter estatísticas da rádio
router.get('/stats', (req: Request, res: Response) => {
  const info = radioStreamService.getCurrentSongInfo();
  const listeners = radioStreamService.getListenerCount();
  
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

export default router;
