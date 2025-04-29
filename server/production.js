/**
 * MCP Integration Platform - Production Server Fallback
 * This is a simplified server for production deployments
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'dist' directory
app.use(express.static(path.join(__dirname, '../client/dist')));

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

// Fallback for SPA - always serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
});
