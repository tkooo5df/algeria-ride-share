// Minimal test server to diagnose Railway deployment issues
const http = require('http');
const fs = require('fs');
const path = require('path');

// Log startup information
console.log('🚀 Starting minimal diagnostic server...');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔧 Node.js version:', process.version);
console.log('📂 Working directory:', process.cwd());

// Get port from environment or default to 3000
const port = process.env.PORT || 3000;
console.log('🌐 Configured port:', port);

// Log all environment variables containing PORT
console.log('\n🔍 PORT-related environment variables:');
Object.keys(process.env)
  .filter(key => key.includes('PORT') || key.includes('HOST'))
  .forEach(key => {
    console.log(`  ${key}: ${process.env[key]}`);
  });

// Check if we're in Railway environment
const isRailway = !!process.env.RAILWAY_PROJECT_ID || !!process.env.RAILWAY_ENVIRONMENT_NAME;
console.log('\n🚂 Railway environment detected:', isRailway);

// Check for dist directory
const distPath = path.join(process.cwd(), 'dist');
console.log('\n📁 Dist directory check:');
console.log('  Path:', distPath);
console.log('  Exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log('  Contents:', fs.readdirSync(distPath));
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`📍 ${timestamp} - ${req.method} ${req.url} from ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
  
  // Health check endpoint
  if (req.url === '/health') {
    console.log('💓 Health check requested');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: port,
      isRailway: isRailway,
      message: 'Minimal server is running successfully'
    }));
    return;
  }
  
  // Test endpoint
  if (req.url === '/test') {
    console.log('🧪 Test endpoint requested');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test successful! Minimal server is working.');
    return;
  }
  
  // Root endpoint - serve index.html if it exists
  if (req.url === '/') {
    console.log('🏠 Root endpoint requested');
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('📄 Serving index.html');
      const content = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Diagnostic Server</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>✅ Minimal Diagnostic Server Running</h1>
          <p>Server is working correctly on port ${port}</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p><a href="/health">Health Check</a> | <a href="/test">Test Endpoint</a></p>
          <p>Dist directory exists: ${fs.existsSync(distPath)}</p>
        </body>
        </html>
      `);
    }
    return;
  }
  
  const distExists = fs.existsSync(distPath);

  // Serve static files from dist directory
  if (distExists) {
    const filePath = path.join(distPath, req.url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      console.log('📄 Serving static file:', req.url);
      const content = fs.readFileSync(filePath);
      // Set content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    }

    // SPA fallback: serve index.html for client-side routes
    const indexPath = path.join(distPath, 'index.html');
    const accepts = req.headers['accept'] || '';
    const wantsHtml = accepts.includes('text/html') || accepts === '*/*';

    if (req.method === 'GET' && fs.existsSync(indexPath) && wantsHtml) {
      console.log('🔄 SPA fallback triggered for:', req.url);
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexContent);
      return;
    }
  }

  // 404 for everything else
  console.log('❓ 404 for:', req.url);
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not found',
    url: req.url,
    timestamp: new Date().toISOString()
  }));
});

// Handle server errors
server.on('error', (err) => {
  console.error('💥 SERVER ERROR:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  } else if (err.code === 'EACCES') {
    console.error(`❌ Permission denied for port ${port}`);
  }
  process.exit(1);
});

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log('\n🎉 ======================================');
  console.log('🎉 MINIMAL SERVER STARTED SUCCESSFULLY!');
  console.log('🎉 ======================================');
  console.log(`🌐 URL: http://0.0.0.0:${port}`);
  console.log(`💓 Health: http://0.0.0.0:${port}/health`);
  console.log(`🧪 Test: http://0.0.0.0:${port}/test`);
  console.log('📡 Server is ready to accept connections');
  console.log('========================================\n');
  
  // Test the server internally
  setTimeout(() => {
    console.log('🔍 Testing server internally...');
    const testReq = http.get(`http://localhost:${port}/health`, (res) => {
      console.log('✅ Internal test - Status:', res.statusCode);
      res.on('data', (chunk) => {
        console.log('📄 Internal test - Response:', chunk.toString().substring(0, 100) + '...');
      });
    });
    testReq.on('error', (err) => {
      console.error('❌ Internal test failed:', err.message);
    });
    testReq.setTimeout(3000, () => {
      console.error('⏱️ Internal test timeout');
      testReq.destroy();
    });
  }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});