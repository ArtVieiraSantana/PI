// Item 2.2 do roteiro da Sprint 2: "Criar um botão no aplicativo para
// gerar dados em formato json, para elaborar um dashboard na disciplina
// Análise de Dados e Estatística". Esta rota é o que esse botão chama:
// exporta os pedidos, os itens de cada pedido e o catálogo de produtos
// em um único JSON, que depois é lido pelo script Python do dashboard
// (ver dashboard/gerar_dashboard.py no projeto).
const express = require('express');
const db = require('../config/db');
const { autenticar, somenteAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/relatorios/export-json - Exporta pedidos + itens + produtos.
// Restrito ao administrador, assim como as demais operações de gestão.
router.get('/export-json', autenticar, somenteAdmin, (req, res) => {
  const pedidos = db.prepare('SELECT * FROM pedidos ORDER BY id').all();
  const itensPedido = db.prepare('SELECT * FROM itens_pedido ORDER BY id').all();
  const produtos = db.prepare('SELECT * FROM produtos ORDER BY id').all();
  const categorias = db.prepare('SELECT * FROM categorias ORDER BY id').all();

  const exportacao = {
    geradoEm: new Date().toISOString(),
    totais: {
      pedidos: pedidos.length,
      produtos: produtos.length,
      faturamentoTotal: pedidos.reduce((soma, p) => soma + p.total, 0),
    },
    pedidos,
    itensPedido,
    produtos,
    categorias,
  };

  const nomeArquivo = `relatorio-zerograu-${Date.now()}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
  res.json(exportacao);
});

module.exports = router;
