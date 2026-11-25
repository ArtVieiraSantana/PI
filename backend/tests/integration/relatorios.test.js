// TESTE DE INTEGRAÇÃO (item 2.6): o endpoint de exportação em JSON
// (item 2.2) que alimenta o dashboard em Python (item 2.5).
const request = require('supertest');
const { inicializarBanco } = require('../../src/config/initDb');

let app;
let tokenAdmin;
let tokenCliente;

beforeAll(async () => {
  inicializarBanco({ silencioso: true });
  app = require('../../src/app');

  tokenAdmin = (
    await request(app).post('/api/auth/login').send({ email: 'admin@zerograu.com', senha: 'admin123' })
  ).body.token;

  tokenCliente = (
    await request(app).post('/api/auth/login').send({ email: 'ana@zerograu.com', senha: 'cliente123' })
  ).body.token;
});

describe('GET /api/relatorios/export-json', () => {
  test('ADMIN consegue exportar os dados em JSON', async () => {
    const resposta = await request(app)
      .get('/api/relatorios/export-json')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveProperty('pedidos');
    expect(resposta.body).toHaveProperty('produtos');
    expect(resposta.body).toHaveProperty('itensPedido');
    expect(resposta.body).toHaveProperty('totais');
    expect(Array.isArray(resposta.body.produtos)).toBe(true);
  });

  test('o header indica um arquivo para download', async () => {
    const resposta = await request(app)
      .get('/api/relatorios/export-json')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resposta.headers['content-disposition']).toMatch(/attachment/);
    expect(resposta.headers['content-disposition']).toMatch(/\.json/);
  });

  test('CLIENTE não pode exportar os dados (403)', async () => {
    const resposta = await request(app)
      .get('/api/relatorios/export-json')
      .set('Authorization', `Bearer ${tokenCliente}`);

    expect(resposta.status).toBe(403);
  });

  test('sem login não pode exportar (401)', async () => {
    const resposta = await request(app).get('/api/relatorios/export-json');
    expect(resposta.status).toBe(401);
  });
});
