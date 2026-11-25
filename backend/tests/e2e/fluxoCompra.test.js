// TESTE E2E (item 2.6): simula a jornada real de um cliente no app,
// encadeando várias chamadas à API na ordem em que o app mobile faria:
// cadastro -> login -> consulta do catálogo -> criação do pedido
// (carrinho/checkout) -> validações de estoque e de autenticação.
const request = require('supertest');
const { inicializarBanco } = require('../../src/config/initDb');

let app;

beforeAll(() => {
  inicializarBanco({ silencioso: true });
  app = require('../../src/app');
});

describe('Fluxo completo: cadastro -> login -> comprar', () => {
  const email = `cliente.e2e.${Date.now()}@zerograu.com`;
  let token;
  let produtoEscolhido;

  test('1) cliente novo se cadastra pelo app', async () => {
    const resposta = await request(app)
      .post('/api/auth/cadastro')
      .send({ nome: 'Cliente E2E', email, senha: 'senha123' });

    expect(resposta.status).toBe(201);
    token = resposta.body.token;
  });

  test('2) cliente consulta o catálogo de produtos (tela principal)', async () => {
    const resposta = await request(app).get('/api/produtos');
    expect(resposta.status).toBe(200);
    expect(resposta.body.length).toBeGreaterThan(0);

    produtoEscolhido = resposta.body.find((p) => p.estoque > 0);
    expect(produtoEscolhido).toBeTruthy();
  });

  test('3) cliente finaliza a compra (formulário de pagamento / pedido)', async () => {
    const resposta = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itens: [{ produtoId: produtoEscolhido.id, quantidade: 1 }],
        formaPagamento: 'mercado_pago',
        enderecoEntrega: 'Rua de Teste, 123',
        frete: 10,
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body.numero_pedido).toMatch(/^ZG/);
    expect(resposta.body.status).toBe('PENDENTE');
    expect(resposta.body.total).toBeCloseTo(produtoEscolhido.preco + 10);
  });

  test('4) pedido aparece na listagem "meus pedidos" do cliente', async () => {
    const resposta = await request(app).get('/api/pedidos').set('Authorization', `Bearer ${token}`);
    expect(resposta.status).toBe(200);
    expect(resposta.body.length).toBeGreaterThanOrEqual(1);
    expect(resposta.body[0].numero_pedido).toMatch(/^ZG/);
  });

  test('5) não é possível pedir mais unidades do que há em estoque', async () => {
    const resposta = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({ itens: [{ produtoId: produtoEscolhido.id, quantidade: 999999 }] });

    expect(resposta.status).toBe(400);
    expect(resposta.body.mensagem).toMatch(/estoque/i);
  });

  test('6) usuário sem login não consegue finalizar pedido', async () => {
    const resposta = await request(app)
      .post('/api/pedidos')
      .send({ itens: [{ produtoId: produtoEscolhido.id, quantidade: 1 }] });

    expect(resposta.status).toBe(401);
  });
});
