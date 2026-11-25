// TESTE UNITÁRIO (item 2.6): testa só a lógica de cálculo do pedido,
// sem banco de dados e sem subir a API — por isso não usa Supertest.
const {
  validarQuantidade,
  calcularSubtotalItem,
  calcularSubtotalPedido,
  calcularTotalPedido,
} = require('../../src/services/pedidoCalculo');

describe('pedidoCalculo (unitário)', () => {
  test('validarQuantidade aceita apenas inteiros positivos', () => {
    expect(validarQuantidade(1)).toBe(true);
    expect(validarQuantidade(5)).toBe(true);
    expect(validarQuantidade(0)).toBe(false);
    expect(validarQuantidade(-2)).toBe(false);
    expect(validarQuantidade(1.5)).toBe(false);
    expect(validarQuantidade(NaN)).toBe(false);
  });

  test('calcularSubtotalItem multiplica preço pela quantidade', () => {
    expect(calcularSubtotalItem(79.9, 2)).toBeCloseTo(159.8);
    expect(calcularSubtotalItem(10, 3)).toBe(30);
  });

  test('calcularSubtotalItem arredonda para 2 casas decimais', () => {
    expect(calcularSubtotalItem(10.005, 3)).toBe(30.02);
  });

  test('calcularSubtotalPedido soma o subtotal de todos os itens', () => {
    const itens = [{ subtotal: 79.9 }, { subtotal: 49.9 }, { subtotal: 20 }];
    expect(calcularSubtotalPedido(itens)).toBeCloseTo(149.8);
  });

  test('calcularSubtotalPedido com lista vazia retorna 0', () => {
    expect(calcularSubtotalPedido([])).toBe(0);
  });

  test('calcularTotalPedido soma o subtotal e o frete', () => {
    expect(calcularTotalPedido(100, 15)).toBe(115);
  });

  test('calcularTotalPedido funciona sem frete informado (padrão 0)', () => {
    expect(calcularTotalPedido(100)).toBe(100);
  });
});
