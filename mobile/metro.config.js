const http = require('node:http');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware(metroMiddleware) {
    return (req, res, next) => {
      if (!req.url?.startsWith('/api/')) return metroMiddleware(req, res, next);

      const proxyRequest = http.request(
        {
          hostname: '127.0.0.1',
          port: 3000,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, host: '127.0.0.1:3000' },
        },
        (proxyResponse) => {
          res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
          proxyResponse.pipe(res);
        }
      );

      proxyRequest.on('error', (error) => {
        console.error('Metro API proxy failed:', error.message);
        if (res.headersSent) return res.destroy();
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensagem: 'Não foi possível conectar à API.' }));
      });

      req.pipe(proxyRequest);
    };
  },
};

module.exports = config;
