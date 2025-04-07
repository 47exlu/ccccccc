import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// First, determine if we're in production or development mode
const isProduction = process.env.NODE_ENV === 'production';

// In production mode, we'll use the pre-built client files
if (isProduction) {
  console.log('Starting server in production mode...');
  const app = express();
  const server = createServer(app);

  // Serve static files from public directory
  app.use(express.static(join(__dirname, 'public')));
  
  // Add API endpoints
  app.use(express.json());
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Serve index.html for all non-API routes (client-side routing)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(__dirname, 'public', 'index.html'));
    }
  });
  
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in production mode on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
  });
} else {
  // In development mode, we'll use the server/index.ts directly
  console.log('Starting server in development mode...');
  exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting dev server: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`Dev server stderr: ${stderr}`);
    }
    
    console.log(`Dev server stdout: ${stdout}`);
  });

  console.log('Development server started on port 5000');
  console.log('You can access the application at: http://localhost:5000');
}