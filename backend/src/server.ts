import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import recipeRoutes from './routes/recipeRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { createServer } from 'http';
import { initSocket } from './utils/socket';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/recipes', recipeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Diagnostic route to test Supabase connectivity from the running server
app.get('/api/debug/supabase', async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return res.status(500).json({ ok: false, message: 'SUPABASE_URL not configured' });
  }

  try {
    const fetchFn = (globalThis as any).fetch;
    if (typeof fetchFn !== 'function') {
      return res.status(500).json({ ok: false, message: 'global fetch is not available in this Node runtime' });
    }

    // Try a simple GET to the supabase host
    const resp = await fetchFn(supabaseUrl, { method: 'GET' });
    return res.status(200).json({ ok: true, status: resp.status, statusText: resp.statusText });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message || String(err) });
  }
});

// Error handling
app.use(errorHandler);

const server = createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
