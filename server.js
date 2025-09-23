const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Add logging
console.log('🚀 Starting Algeria Ride Share server...');
console.log('📊 Environment details:');
console.log('  PORT:', port);
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  Current directory:', __dirname);
console.log('  Process CWD:', process.cwd());

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
console.log('📁 Checking build files:');
console.log('  Dist path:', distPath);
console.log('  Dist exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  const indexPath = path.join(distPath, 'index.html');
  console.log('  Index.html exists:', fs.existsSync(indexPath));
  if (fs.existsSync(indexPath)) {
    const stats = fs.statSync(indexPath);
    console.log('  Index.html size:', stats.size, 'bytes');
  }
} else {
  console.error('❌ CRITICAL: dist directory not found!');
  console.log('📋 Directory contents:', fs.readdirSync(__dirname));
}

// Add middleware for request logging
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint (must come before static middleware)
app.get('/health', (req, res) => {
  console.log('💓 Health check requested');
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    distExists: fs.existsSync(distPath),
    port: port
  };
  res.status(200).json(healthStatus);
});

// Serve static files from the dist directory
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Static file serving enabled for:', distPath);
} else {
  console.error('❌ Cannot serve static files - dist directory missing');
}

// Handle React Router (SPA) - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('📄 Serving index.html for:', req.url);
    res.sendFile(indexPath);
  } else {
    console.error('❌ index.html not found for route:', req.url);
    res.status(404).json({
      error: 'Application not built properly',
      message: 'dist/index.html not found',
      requestedPath: req.url,
      distPath: distPath,
      distExists: fs.existsSync(distPath)
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log('\n🎉 SUCCESS! Server is running:');
  console.log(`🌐 URL: http://0.0.0.0:${port}`);
  console.log(`💓 Health: http://0.0.0.0:${port}/health`);
  console.log('📡 Server is ready to accept connections\n');
});

// Handle server errors
server.on('error', (err) => {
  console.error('💥 Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});