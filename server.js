// SHREE YATRI NIVAS - Built-in High-Performance HTTP & REST API Server
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function resolveStaticFile(publicDir, reqPath) {
  let cleanPath = decodeURIComponent(reqPath.split('?')[0]);
  if (cleanPath === '/' || cleanPath === '') cleanPath = '/index.html';
  cleanPath = cleanPath.replace(/\/+$/, '');
  if (!cleanPath) cleanPath = '/index.html';

  const candidates = [
    path.join(publicDir, cleanPath),
    path.join(publicDir, cleanPath + '.html'),
    path.join(publicDir, cleanPath, 'index.html')
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {}
  }
  return null;
}

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

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  // REST API Endpoints
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (pathname === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'UP', service: 'SHREE YATRI NIVAS REST API', timestamp: new Date().toISOString() }));
      return;
    }

    if (pathname === '/api/info') {
      res.writeHead(200);
      res.end(JSON.stringify({
        name: 'SHREE YATRI NIVAS',
        tagline: 'Divine Comfort, Peaceful Lodging & Authentic Hospitality',
        phone: '+91 98220 12345',
        whatsapp: '919822012345',
        email: 'info@shreeyatrinivas.com',
        location: 'Station Road, Near Central Temple Gate, Pandharpur, Maharashtra - 413304'
      }));
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
            res.end(JSON.stringify({ success: true, token: 'syn-session-token-' + Date.now(), role: 'ADMIN' }));
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
    res.end(JSON.stringify({ message: `API endpoint ${pathname} is active.` }));
    return;
  }

  // Static File Serving
  const resolvedPath = resolveStaticFile(PUBLIC_DIR, pathname);

  if (!resolvedPath) {
    const notFoundPath = path.join(PUBLIC_DIR, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFoundPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>404 — Page Not Found | Shree Yatri Nivas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body style="background:#f8f8f7; min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center; padding:2rem; font-family:sans-serif;">
        <div style="background:#ffffff; border:1px solid #e6e5e2; border-radius:16px; padding:3rem 2rem; max-width:480px; box-shadow:0 8px 24px rgba(0,0,0,0.06);">
          <h1 style="font-size:2rem; color:#1a1a19; margin-bottom:0.75rem;">Page Not Found</h1>
          <p style="color:#6f6e69; margin-bottom:2rem; font-size:0.95rem;">The page or resource you requested does not exist or has moved.</p>
          <a href="/" style="display:inline-block; background:#1a1a19; color:#ffffff; padding:0.75rem 2rem; border-radius:9999px; text-decoration:none; font-weight:500;">Return to Home</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
  });

  const stream = fs.createReadStream(resolvedPath);
  stream.pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`  SHREE YATRI NIVAS Lodging System is Running!`);
  console.log(`  Listening on:    http://${HOST}:${PORT}`);
  console.log(`  Customer Portal: http://localhost:${PORT}`);
  console.log(`  Rooms & Rates:   http://localhost:${PORT}/rooms.html`);
  console.log(`  Online Booking:  http://localhost:${PORT}/booking.html`);
  console.log(`  Guest Reviews:   http://localhost:${PORT}/reviews.html`);
  console.log(`  Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`=======================================================`);
});
