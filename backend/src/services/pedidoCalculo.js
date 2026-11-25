// Regras de cálculo do pedido, isoladas em funções puras (sem acesso a
// banco de dados ou HTTP) justamente para permitir testes UNITÁRIOS de
// verdade (item 2.6 do roteiro), separados dos testes de integração que
// batem na API via Supertest.

function validarQuantidade(quantidade) {
  return Number.isInteger(quantidade) && quantidade > 0;
}

function calcularSubtotalItem(preco, quantidade) {
  return Number((preco * quantidade).toFixed(2));
}

function calcularSubtotalPedido(itensComSubtotal) {
  return Number(itensComSubtotal.reduce((soma, item) => soma + item.subtotal, 0).toFixed(2));
}

function calcularTotalPedido(subtotal, frete = 0) {
  return Number((subtotal + frete).toFixed(2));
}

module.exports = {
  validarQuantidade,
  calcularSubtotalItem,
  calcularSubtotalPedido,
  calcularTotalPedido,
};
