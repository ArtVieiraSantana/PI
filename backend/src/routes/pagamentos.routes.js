const express = require('express');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

// Integração com a API do Mercado Pago (Checkout Pro).
// Requer a variável de ambiente MP_ACCESS_TOKEN (token de teste/produção
// obtido no painel de desenvolvedores do Mercado Pago).
let mercadopago = null;
try {
  mercadopago = require('mercadopago');
} catch (e) {
  // pacote instalado via `npm install mercadopago` (ver README do backend)
}

// POST /api/pagamentos/preferencia - Cria a preferência de pagamento
// usada pelo formulário de pagamento (tela de checkout) do app mobile.
router.post('/preferencia', autenticar, async (req, res) => {
  const { itens, pedidoNumero } = req.body;

  if (!mercadopago) {
    return res.status(501).json({
      mensagem: 'SDK do Mercado Pago não instalado. Rode "npm install mercadopago" no backend.',
    });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken || accessToken === 'seu-access-token-de-teste-do-mercado-pago') {
    return res.status(503).json({
      mensagem: 'Mercado Pago não configurado. Defina MP_ACCESS_TOKEN no arquivo backend/.env e reinicie a API.',
    });
  }

  if (!Array.isArray(itens) || itens.length === 0 || !pedidoNumero) {
    return res.status(400).json({ mensagem: 'Número do pedido e itens são obrigatórios.' });
  }

  try {
    const client = new mercadopago.MercadoPagoConfig({
      accessToken,
    });
    const preference = new mercadopago.Preference(client);

    const resultado = await preference.create({
      body: {
        items: itens.map((item) => ({
          title: item.nome,
          quantity: item.quantidade,
          unit_price: item.preco,
          currency_id: 'BRL',
        })),
        external_reference: pedidoNumero,
        back_urls: {
          success: 'zerograu://checkout/sucesso',
          failure: 'zerograu://checkout/falha',
          pending: 'zerograu://checkout/pendente',
        },
      },
    });

    res.json({ preferenceId: resultado.id, initPoint: resultado.init_point });
  } catch (err) {
    const detalhe = err.cause?.message || err.message;
    res.status(502).json({
      mensagem: `Mercado Pago recusou a preferência: ${detalhe}`,
    });
  }
});

module.exports = router;
