// SHREE YATRI NIVAS - Built-in High-Performance HTTP & REST API Server
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // Serve index.html for root
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // REST API Endpoints (Section 14 of specification)
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    if (pathname === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'UP', service: 'SHREE YATRI NIVAS REST API' }));
      return;
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          if (data.username === 'admin' && data.password === 'admin123') {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, token: 'mock-jwt-token-syn-2026', role: 'ADMIN' }));
          } else {
            res.writeHead(401);
            res.end(JSON.stringify({ success: false, message: 'Invalid admin credentials' }));
          }
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'Invalid JSON body' }));
        }
      });
      return;
    }

    // Default API fallback
    res.writeHead(200);
    res.end(JSON.stringify({ message: `API endpoint ${pathname} ready.` }));
    return;
  }

  // Static File Serving
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <div style="font-family:sans-serif; text-align:center; padding: 4rem;">
          <h1>404 - Page Not Found</h1>
          <p>The requested file does not exist.</p>
          <a href="/" style="color:#d97706; text-decoration:none; font-weight:bold;">Return to Home</a>
        </div>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SHREE YATRI NIVAS Lodging System is Running!`);
  console.log(`  Customer Portal: http://localhost:${PORT}`);
  console.log(`  Rooms & Rates:   http://localhost:${PORT}/rooms.html`);
  console.log(`  Online Booking:  http://localhost:${PORT}/booking.html`);
  console.log(`  Guest Reviews:   http://localhost:${PORT}/reviews.html`);
  console.log(`  Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`=======================================================`);
});
