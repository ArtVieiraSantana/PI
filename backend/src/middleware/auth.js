const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zerograu-pi4-dev-secret';

function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não informado.' });
  }
  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}

function somenteAdmin(req, res, next) {
  if (req.usuario?.perfil !== 'ADMIN') {
    return res.status(403).json({ mensagem: 'Acesso restrito ao administrador.' });
  }
  next();
}

module.exports = { autenticar, somenteAdmin, JWT_SECRET };
