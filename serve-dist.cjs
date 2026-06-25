const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const port = process.env.PORT || 8080;

const mime = {
  html: 'text/html; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/' || urlPath.endsWith('/')) urlPath = path.posix.join(urlPath, 'index.html');
    const filePath = path.join(root, urlPath);
    if (!filePath.startsWith(root)) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        const index = path.join(root, 'index.html');
        if (fs.existsSync(index)) {
          res.setHeader('Content-Type', mime.html);
          fs.createReadStream(index).pipe(res);
        } else {
          res.statusCode = 404;
          res.end('Not found');
        }
        return;
      }
      const ext = path.extname(filePath).slice(1);
      const type = mime[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', type);
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${root} on http://0.0.0.0:${port}`);
});
