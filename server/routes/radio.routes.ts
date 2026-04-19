import { Router, Request, Response } from 'express';
import { radioStreamSimpleService } from '../services/radioStreamSimple.js';
import { isValidAdminPassword } from "../auth/adminAuth.js";

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

router.get('/queue', (_req: Request, res: Response) => {
  const currentSong = radioStreamSimpleService.getCurrentSongInfo();
  const upcoming = radioStreamSimpleService.getUpcomingSongs(5);

  res.json({
    currentSong: {
      title: currentSong.title,
      artist: currentSong.artist,
      position: currentSong.position,
      duration: currentSong.duration,
    },
    upcoming,
    totalSongs: currentSong.total,
  });
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
  const info = radioStreamSimpleService.getCurrentSongInfo();
  const isOnline = info.title !== 'Rádio Offline';
  
  res.json({
    status: isOnline ? 'online' : 'offline',
    currentSong: info,
    listeners: 0,
    message: isOnline ? 'Rádio funcionando normalmente' : 'Rádio não iniciada - verifique os logs do servidor'
  });
});

// Middleware de autenticação para rotas de admin
const adminAuth = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.RADIO_ADMIN_KEY;

  if (!adminKey) {
    return res.status(500).json({ error: 'Chave de admin não configurada no servidor' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.substring(7);
  
  if (token !== adminKey) {
    return res.status(403).json({ error: 'Token de autenticação inválido' });
  }

  next();
};

// Rotas de administração da rádio
router.post('/admin/next', adminAuth, (req: Request, res: Response) => {
  radioStreamSimpleService.skipToNext();
  const info = radioStreamSimpleService.getCurrentSongInfo();
  res.json({ success: true, currentSong: info });
});

router.post('/admin/restart', adminAuth, (req: Request, res: Response) => {
  radioStreamSimpleService.restart();
  const info = radioStreamSimpleService.getCurrentSongInfo();
  res.json({ success: true, currentSong: info });
});

router.get('/admin/playlist', adminAuth, (req: Request, res: Response) => {
  const playlist = radioStreamSimpleService.getPlaylist();
  res.json({ playlist });
});

router.post('/admin/play/:index', adminAuth, (req: Request, res: Response) => {
  const index = parseInt(req.params.index);
  if (isNaN(index)) {
    return res.status(400).json({ error: 'Index inválido' });
  }
  radioStreamSimpleService.playSpecificSong(index);
  const info = radioStreamSimpleService.getCurrentSongInfo();
  res.json({ success: true, currentSong: info });
});

// Endpoint de diagnóstico de sistema de arquivos
router.get('/debug/files', (req: Request, res: Response, next: Function) => {
  const providedPassword = req.headers["x-admin-password"];

  if (typeof providedPassword !== "string" || !isValidAdminPassword(providedPassword)) {
    return res.status(401).json({ error: "Senha de administrador incorreta" });
  }

  next();
}, async (req: Request, res: Response) => {
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
