import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// These are needed because __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// For Replit environment, always use port 5000
const PORT = 5000;

// Set environment mode for debugging
process.env.NODE_ENV = "development";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add a health check endpoint for debugging
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check environment
app.get('/api/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    port: PORT,
    host: '0.0.0.0'
  });
});

// Add a simple HTML page to check if the server is working properly
app.get('/test-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rap Empire Simulator - Test Page</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #111;
            color: #fff;
          }
          h1 {
            color: #e879f9;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
          }
          .success {
            background-color: #166534;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          button {
            background-color: #6366f1;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background-color: #4f46e5;
          }
          #result {
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #444;
            border-radius: 5px;
            min-height: 100px;
          }
        </style>
      </head>
      <body>
        <h1>Rap Empire Simulator - Server Test Page</h1>
        <div class="success">
          <p>✅ Server is running correctly if you can see this page!</p>
        </div>
        <p>This is a test page to verify the server is functioning properly.</p>
        <button onclick="testApi()">Test API Connection</button>
        <div id="result"></div>
        
        <script>
          function testApi() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Testing API connection...';
            
            fetch('/api/health')
              .then(response => response.json())
              .then(data => {
                resultDiv.innerHTML = '✅ API connection successful!<br><pre>' + 
                  JSON.stringify(data, null, 2) + '</pre>';
              })
              .catch(error => {
                resultDiv.innerHTML = '❌ API connection failed: ' + error.message;
              });
          }
        </script>
      </body>
    </html>
  `);
});

// Serve the privacy policy for Google Play Store submission
app.get('/privacy-policy.html', (req, res) => {
  const privacyPolicyPath = path.resolve(__dirname, '..', 'public', 'privacy-policy.html');
  fs.readFile(privacyPolicyPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading privacy policy file:', err);
      return res.status(404).send('Privacy Policy not found');
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log('Starting server in development mode...');
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Server error:', err);
    res.status(status).json({ message });
  });

  // Always use Vite in Replit environment for development
  console.log('Setting up Vite...');
  await setupVite(app, server);

  // Use the PORT variable defined earlier
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Application URL: http://localhost:${PORT}`);
    log(`serving on port ${PORT}`);
  });
})();
