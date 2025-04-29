
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files with correct MIME types
app.use(express.static('dist', {
  setHeaders: (res, path) => {
    // Set correct MIME types for JS and CSS files
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    
    // Add caching headers
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for static assets
  }
}));

// API endpoint to check status
app.get('/api/status', (req, res) => {
  res.json({
    version: '0.1.0-alpha',
    uptime: process.uptime(),
    transport: 'http',
    env: 'production',
    time: new Date().toISOString()
  });
});

// Always serve index.html for any unknown routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running at http://0.0.0.0:${PORT}`);
});
