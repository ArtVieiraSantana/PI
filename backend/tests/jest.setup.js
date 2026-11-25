// Garante que todo teste rode contra o banco SQLite em memória (ver
// src/config/db.js), nunca contra o banco de desenvolvimento.
process.env.NODE_ENV = 'test';
