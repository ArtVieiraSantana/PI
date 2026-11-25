// Executa o script schema.sql (database/schema.sql) sobre o banco SQLite
// da API, criando as tabelas do DER e inserindo os dados de seed.
//
// CORREÇÃO: o script criava as tabelas e o catálogo de produtos, mas
// nunca criava nenhuma conta de usuário. Sem isso não existe nenhuma
// conta com perfil ADMIN, e a tela principal (HomeScreen) só mostra os
// botões de Inserir/Alterar/Excluir produto quando o usuário logado
// tem perfil 'ADMIN' — por isso, mesmo com o código já implementado,
// ninguém conseguia ver ou testar essas funções.
//
// Exportado como função (inicializarBanco) para que os testes
// automatizados (item 2.6) também possam popular o banco em memória
// antes de rodar, além de continuar funcionando como script via
// "npm run init-db".
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

function inicializarBanco({ silencioso = false } = {}) {
  const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  const total = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total;
  if (total > 0) {
    if (!silencioso) console.log('Usuários já existentes — seed de usuários ignorado.');
    return;
  }

  const usuarios = [
    { nome: 'Admin ZeroGrau', email: 'admin@zerograu.com', senha: 'admin123', perfil: 'ADMIN' },
    { nome: 'Ana Souza', email: 'ana@zerograu.com', senha: 'cliente123', perfil: 'CLIENTE' },
  ];

  const inserir = db.prepare(
    'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)'
  );

  for (const u of usuarios) {
    const senhaHash = bcrypt.hashSync(u.senha, 10);
    inserir.run(u.nome, u.email, senhaHash, u.perfil);
  }

  if (!silencioso) {
    console.log('Usuários de teste criados:');
    console.log('  ADMIN   -> admin@zerograu.com / admin123  (vê e usa Inserir/Alterar/Excluir produto)');
    console.log('  CLIENTE -> ana@zerograu.com / cliente123  (não vê os controles de administrador)');
  }
}

// Quando rodado diretamente ("npm run init-db"), executa e loga como antes.
if (require.main === module) {
  inicializarBanco();
  console.log('Banco de dados inicializado com sucesso em backend/database/zerograu.db');
}

module.exports = { inicializarBanco };
