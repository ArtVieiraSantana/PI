// Conexão com o banco de dados relacional da API.
//
// CORREÇÃO: esta versão usava o módulo nativo "node:sqlite", que só
// funciona sem flag a partir do Node 22.13. Em máquinas com Node mais
// antigo isso quebrava logo no "npm run init-db" com o erro
// "ERR_UNKNOWN_BUILTIN_MODULE: No such built-in module: node:sqlite".
// Trocado para o pacote "better-sqlite3", que tem exatamente a mesma
// API (db.exec / db.prepare().get()/.all()/.run(), inclusive
// "lastInsertRowid" no resultado) e funciona em qualquer Node moderno
// (a partir da versão 18), sem exigir uma versão recente do Node.
//
// Item 2.6 (Qualidade de Software — testes): quando os testes rodam
// (NODE_ENV=test), usamos um banco SQLite em memória, isolado do banco
// de desenvolvimento, para não misturar dados de teste com dados reais.
const path = require('path');
const Database = require('better-sqlite3');

const dbPath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.join(__dirname, '..', '..', 'database', 'zerograu.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
