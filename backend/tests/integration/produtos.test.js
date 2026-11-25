// TESTE DE INTEGRAÇÃO (item 2.6): CRUD de produtos (inserir, alterar,
// excluir, consultar) e o controle de acesso — só ADMIN pode escrever.
const request = require('supertest');
const { inicializarBanco } = require('../../src/config/initDb');

let app;
let tokenAdmin;
let tokenCliente;

beforeAll(async () => {
  inicializarBanco({ silencioso: true });
  app = require('../../src/app');

  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@zerograu.com', senha: 'admin123' });
  tokenAdmin = loginAdmin.body.token;

  const loginCliente = await request(app)
    .post('/api/auth/login')
    .send({ email: 'ana@zerograu.com', senha: 'cliente123' });
  tokenCliente = loginCliente.body.token;
});

describe('GET /api/produtos', () => {
  test('lista produtos sem precisar estar autenticado', async () => {
    const resposta = await request(app).get('/api/produtos');
    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
    expect(resposta.body.length).toBeGreaterThan(0);
  });
});

describe('POST /api/produtos (inserir)', () => {
  test('ADMIN consegue inserir um novo produto', async () => {
    const resposta = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Produto de Teste', descricao: 'desc', preco: 50, estoque: 10 });

    expect(resposta.status).toBe(201);
    expect(resposta.body.id).toBeTruthy();
    expect(resposta.body.nome).toBe('Produto de Teste');
  });

  test('CLIENTE não consegue inserir produto (403)', async () => {
    const resposta = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ nome: 'Não deveria entrar', preco: 10 });

    expect(resposta.status).toBe(403);
  });

  test('sem token não consegue inserir produto (401)', async () => {
    const resposta = await request(app).post('/api/produtos').send({ nome: 'Sem token', preco: 10 });
    expect(resposta.status).toBe(401);
  });
});

describe('PUT e DELETE /api/produtos/:id (alterar / excluir)', () => {
  let produtoId;

  beforeAll(async () => {
    const criado = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nome: 'Produto para editar', descricao: 'x', preco: 20, estoque: 5 });
    produtoId = criado.body.id;
  });

  test('ADMIN consegue alterar preço e estoque', async () => {
    const resposta = await request(app)
      .put(`/api/produtos/${produtoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ preco: 35, estoque: 2 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.preco).toBe(35);
    expect(resposta.body.estoque).toBe(2);
  });

  test('consulta por id reflete a alteração', async () => {
    const resposta = await request(app).get(`/api/produtos/${produtoId}`);
    expect(resposta.status).toBe(200);
    expect(resposta.body.preco).toBe(35);
  });

  test('ADMIN consegue excluir o produto', async () => {
    const resposta = await request(app)
      .delete(`/api/produtos/${produtoId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resposta.status).toBe(204);
  });

  // A exclusão é lógica (ativo = 0, ver produtos.routes.js), não remove a
  // linha do banco — por isso o produto some da LISTAGEM (catálogo da
  // Home, que só traz ativo = 1), mas a consulta direta por id ainda o
  // encontra, já com ativo: 0.
  test('produto excluído some da listagem pública', async () => {
    const resposta = await request(app).get('/api/produtos');
    const ids = resposta.body.map((p) => p.id);
    expect(ids).not.toContain(produtoId);
  });

  test('produto excluído continua consultável por id, mas com ativo = 0', async () => {
    const resposta = await request(app).get(`/api/produtos/${produtoId}`);
    expect(resposta.status).toBe(200);
    expect(resposta.body.ativo).toBe(0);
  });
});
