import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.js';
import hdbHandler from './api/hdb.ts';
import busArrivalHandler from './api/bus-arrival.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Mount serverless endpoints at /api/*
  app.all('/api/health', (req, res) => {
    return healthHandler(req, res);
  });

  app.all('/api/hdb', (req, res) => {
    return hdbHandler(req, res);
  });

  app.all('/api/bus-arrival', (req, res) => {
    return busArrivalHandler(req, res);
  });

  app.all('/api/bus', (req, res) => {
    return busArrivalHandler(req, res);
  });

  // In production, serve static built files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
  });
}

// Only start when executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(console.error);
}

export default startServer;
