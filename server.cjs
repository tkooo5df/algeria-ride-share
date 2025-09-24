const express = require('express');
const path = require('path');
const fs = require('fs');

// Immediate startup logging
console.log('==========================================');
console.log('🚀 STARTING ALGERIA RIDE SHARE SERVER');
console.log('==========================================');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔧 Node.js version:', process.version);
console.log('💾 Memory usage:', JSON.stringify(process.memoryUsage(), null, 2));
console.log('📂 Working directory:', process.cwd());
console.log('📍 Script location:', __filename);

const app = express();
const port = process.env.PORT || 3000;

console.log('\n🌐 PORT CONFIGURATION:');
console.log('  Railway PORT env:', process.env.PORT);
console.log('  Using port:', port);
console.log('  Port type:', typeof port);

console.log('\n🔍 ENVIRONMENT VARIABLES:');
Object.keys(process.env)
  .filter(key => key.includes('PORT') || key.includes('HOST') || key.includes('RAILWAY'))
  .forEach(key => {
    console.log(`  ${key}:`, process.env[key]);
  });

console.log('\n📁 FILE SYSTEM CHECK:');
console.log('  Current directory contents:');
try {
  const files = fs.readdirSync(process.cwd());
  files.forEach(file => {
    try {
      const stats = fs.statSync(file);
      console.log(`    ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
    } catch (err) {
      console.log(`    📄 ${file} (inaccessible)`);
    }
  });
} catch (err) {
  console.error('  ❌ Error reading directory:', err.message);
}

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
console.log('\n🏗️ BUILD FILES CHECK:');
console.log('  Dist path:', distPath);
console.log('  Dist exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log('  Dist directory contents:');
  try {
    const distFiles = fs.readdirSync(distPath);
    distFiles.forEach(file => {
      try {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        console.log(`    ${stats.isDirectory() ? '📁' : '📄'} ${file} (${stats.size} bytes)`);
      } catch (err) {
        console.log(`    📄 ${file} (inaccessible)`);
      }
    });
    
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const stats = fs.statSync(indexPath);
      console.log('  ✅ index.html found:', stats.size, 'bytes');
      // Read first 200 chars of index.html to verify it's valid
      const content = fs.readFileSync(indexPath, 'utf8').substring(0, 200);
      console.log('  📝 index.html preview:', content.replace(/\n/g, ' '));
    } else {
      console.log('  ❌ index.html NOT found');
    }
  } catch (err) {
    console.error('  ❌ Error reading dist directory:', err.message);
  }
} else {
  console.error('  ❌ CRITICAL: dist directory not found!');
}

console.log('\n⚙️ EXPRESS APP SETUP:');

// Add middleware for request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📍 ${timestamp} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint hit');
  res.status(200).send('Server is running! Time: ' + new Date().toISOString());
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
    port: port,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
  console.log('💓 Health response:', JSON.stringify(healthStatus, null, 2));
  res.status(200).json(healthStatus);
});

console.log('✅ Health check endpoint configured at /health');

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
  console.log(`🔄 SPA route request: ${req.url}`);
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

console.log('\n🚀 STARTING SERVER...');

// Start server with detailed logging
const server = app.listen(port, '0.0.0.0', () => {
  console.log('\n🎉 ================================');
  console.log('🎉 SERVER STARTED SUCCESSFULLY!');
  console.log('🎉 ================================');
  console.log(`🌐 URL: http://0.0.0.0:${port}`);
  console.log(`💓 Health: http://0.0.0.0:${port}/health`);
  console.log(`🧪 Test: http://0.0.0.0:${port}/test`);
  console.log('📡 Server is ready to accept connections');
  console.log('⏰ Startup time:', new Date().toISOString());
  console.log('================================\n');
  
  // Make a self-request to health endpoint to test it
  setTimeout(() => {
    console.log('🔍 Testing health endpoint internally...');
    const http = require('http');
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      console.log('✅ Internal health check status:', res.statusCode);
      res.on('data', (data) => {
        console.log('📄 Internal health response:', data.toString().substring(0, 200) + '...');
      });
    });
    req.on('error', (err) => {
      console.error('❌ Internal health check failed:', err.message);
    });
    req.setTimeout(5000, () => {
      console.error('⏱️ Internal health check timeout');
      req.destroy();
    });
  }, 1000);
});

// Handle server errors
server.on('error', (err) => {
  console.error('\n💥 ================================');
  console.error('💥 SERVER FAILED TO START!');
  console.error('💥 ================================');
  console.error('Error details:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  } else if (err.code === 'EACCES') {
    console.error(`❌ Permission denied for port ${port}`);
  }
  console.error('================================\n');
  process.exit(1);
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

// Log any uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n💥 UNCAUGHT EXCEPTION:');
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 UNHANDLED REJECTION:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
});