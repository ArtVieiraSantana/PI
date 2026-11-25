const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/cadastro - Tela de cadastro do usuário
router.post('/cadastro', (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
  }

  const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existente) {
    return res.status(409).json({ mensagem: 'Já existe um usuário com este email.' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);
  const info = db
    .prepare('INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)')
    .run(nome, email, senhaHash, 'CLIENTE');

  const usuario = { id: info.lastInsertRowid, nome, email, perfil: 'CLIENTE' };
  const token = jwt.sign(usuario, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, usuario });
});

// POST /api/auth/login - Tela de login do usuário
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const registro = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!registro || !bcrypt.compareSync(senha, registro.senha_hash)) {
    return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
  }

  const usuario = { id: registro.id, nome: registro.nome, email: registro.email, perfil: registro.perfil };
  const token = jwt.sign(usuario, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, usuario });
});

module.exports = router;
