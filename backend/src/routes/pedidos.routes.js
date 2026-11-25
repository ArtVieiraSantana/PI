const express = require('express');
const db = require('../config/db');
const { autenticar } = require('../middleware/auth');
const {
  validarQuantidade,
  calcularSubtotalItem,
  calcularSubtotalPedido,
  calcularTotalPedido,
} = require('../services/pedidoCalculo');

const router = express.Router();

// POST /api/pedidos - Fechar pedido a partir do carrinho (formulário de pagamento)
router.post('/', autenticar, (req, res) => {
  const { itens, formaPagamento, enderecoEntrega, frete } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ mensagem: 'O pedido precisa ter ao menos um item.' });
  }

  const valorFrete = Number(frete ?? 0);
  if (!Number.isFinite(valorFrete) || valorFrete < 0) {
    return res.status(400).json({ mensagem: 'O frete precisa ser um valor não negativo.' });
  }

  const buscarProduto = db.prepare('SELECT * FROM produtos WHERE id = ?');
  let itensCalculados;
  try {
    itensCalculados = itens.map((item) => {
      const quantidade = Number(item.quantidade);
      if (!validarQuantidade(quantidade)) {
        throw new Error('A quantidade de cada item precisa ser um número inteiro positivo.');
      }

      const produto = buscarProduto.get(item.produtoId);
      if (!produto || !produto.ativo) throw new Error(`Produto ${item.produtoId} não encontrado.`);
      if (quantidade > produto.estoque) throw new Error(`Estoque insuficiente para ${produto.nome}.`);

      const itemSubtotal = calcularSubtotalItem(produto.preco, quantidade);
      return { produtoId: produto.id, quantidade, precoUnitario: produto.preco, subtotal: itemSubtotal };
    });
  } catch (err) {
    return res.status(400).json({ mensagem: err.message });
  }

  const subtotal = calcularSubtotalPedido(itensCalculados);
  const total = calcularTotalPedido(subtotal, valorFrete);
  const numeroPedido = `ZG${Date.now()}`;

  const inserirPedido = db.prepare(
    `INSERT INTO pedidos (numero_pedido, usuario_id, status, subtotal, frete, total, forma_pagamento, endereco_entrega)
     VALUES (?, ?, 'PENDENTE', ?, ?, ?, ?, ?)`
  );
  const inserirItem = db.prepare(
    `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
     VALUES (?, ?, ?, ?, ?)`
  );

  db.exec('BEGIN');
  try {
    const info = inserirPedido.run(
      numeroPedido,
      req.usuario.id,
      subtotal,
      valorFrete,
      total,
      formaPagamento || 'mercado_pago',
      enderecoEntrega || null
    );
    for (const item of itensCalculados) {
      inserirItem.run(info.lastInsertRowid, item.produtoId, item.quantidade, item.precoUnitario, item.subtotal);
    }
    db.exec('COMMIT');

    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(pedido);
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(400).json({ mensagem: err.message });
  }
});

// GET /api/pedidos - Consultar pedidos do usuário autenticado
router.get('/', autenticar, (req, res) => {
  const pedidos = db.prepare('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC').all(req.usuario.id);
  res.json(pedidos);
});

module.exports = router;
