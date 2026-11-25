const express = require('express');
const db = require('../config/db');
const { autenticar, somenteAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/produtos - Consultar produtos (tela principal)
router.get('/', (req, res) => {
  const produtos = db
    .prepare(
      `SELECT p.*, c.nome AS categoria_nome
       FROM produtos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE p.ativo = 1
       ORDER BY p.id DESC`
    )
    .all();
  res.json(produtos);
});

// GET /api/produtos/:id - Consultar um produto específico
router.get('/:id', (req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  res.json(produto);
});

// POST /api/produtos - Inserir produto (somente admin)
router.post('/', autenticar, somenteAdmin, (req, res) => {
  const { nome, descricao, preco, estoque, sku, imagemUrl, categoriaId } = req.body;
  if (!nome || preco == null) {
    return res.status(400).json({ mensagem: 'Nome e preço são obrigatórios.' });
  }

  const info = db
    .prepare(
      `INSERT INTO produtos (nome, descricao, preco, estoque, sku, imagem_url, categoria_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(nome, descricao || null, preco, estoque || 0, sku || null, imagemUrl || null, categoriaId || null);

  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(produto);
});

// PUT /api/produtos/:id - Alterar produto (somente admin)
router.put('/:id', autenticar, somenteAdmin, (req, res) => {
  const existente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ mensagem: 'Produto não encontrado.' });

  const { nome, descricao, preco, estoque, sku, imagemUrl, categoriaId } = req.body;
  db.prepare(
    `UPDATE produtos
     SET nome = ?, descricao = ?, preco = ?, estoque = ?, sku = ?, imagem_url = ?, categoria_id = ?, atualizado_em = datetime('now')
     WHERE id = ?`
  ).run(
    nome ?? existente.nome,
    descricao ?? existente.descricao,
    preco ?? existente.preco,
    estoque ?? existente.estoque,
    sku ?? existente.sku,
    imagemUrl ?? existente.imagem_url,
    categoriaId ?? existente.categoria_id,
    req.params.id
  );

  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  res.json(produto);
});

// DELETE /api/produtos/:id - Excluir produto (somente admin)
router.delete('/:id', autenticar, somenteAdmin, (req, res) => {
  const existente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ mensagem: 'Produto não encontrado.' });

  db.prepare('UPDATE produtos SET ativo = 0 WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
