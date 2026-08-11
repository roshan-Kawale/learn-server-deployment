const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = new Date();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// HTTP Request Logging Middleware (logs method, path, status, duration, and client IP from Nginx)
app.use((req, res, next) => {
  const start = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

  res.on('finish', () => {
    // Exclude repetitive container healthcheck logs to keep logs clean
    if (req.originalUrl !== '/api/health') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms - Client IP: ${clientIp}`);
    }
  });

  next();
});

// API Health Check Endpoint
app.get('/api/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`,
    uptimeSeconds: uptimeSeconds,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Info Endpoint - Server and Container Metrics
app.get('/api/info', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
  res.json({
    server: {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      cpus: os.cpus().length,
      totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
      nodeVersion: process.version,
      serverTime: new Date().toISOString()
    },
    client: {
      ip: clientIp,
      userAgent: req.headers['user-agent'] || 'Unknown'
    },
    container: {
      isDockerized: process.env.NODE_ENV === 'production' || process.env.DOCKER_CONTAINER === 'true',
      port: PORT
    }
  });
});

// Catch-all route to serve dashboard UI
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(` 🚀 Node.js Deployment Server Running`);
  console.log(` 📍 Address: http://0.0.0.0:${PORT}`);
  console.log(` 💻 Hostname: ${os.hostname()}`);
  console.log(` ⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================\n`);
});
