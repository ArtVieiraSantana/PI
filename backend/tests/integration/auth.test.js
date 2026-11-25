// TESTE DE INTEGRAÇÃO (item 2.6): usa Supertest para bater nas rotas
// reais da API (Express + banco SQLite em memória), sem mockar nada.
const request = require('supertest');
const { inicializarBanco } = require('../../src/config/initDb');

let app;

beforeAll(() => {
  inicializarBanco({ silencioso: true });
  app = require('../../src/app');
});

describe('POST /api/auth/cadastro', () => {
  test('cria um novo usuário com perfil CLIENTE e devolve um token', async () => {
    const resposta = await request(app).post('/api/auth/cadastro').send({
      nome: 'Teste Integração',
      email: 'teste.integracao@zerograu.com',
      senha: 'senha123',
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body.token).toBeTruthy();
    expect(resposta.body.usuario.perfil).toBe('CLIENTE');
    expect(resposta.body.usuario.email).toBe('teste.integracao@zerograu.com');
  });

  test('rejeita cadastro com email já existente', async () => {
    await request(app).post('/api/auth/cadastro').send({
      nome: 'Duplicado',
      email: 'duplicado@zerograu.com',
      senha: 'senha123',
    });

    const resposta = await request(app).post('/api/auth/cadastro').send({
      nome: 'Duplicado 2',
      email: 'duplicado@zerograu.com',
      senha: 'outrasenha',
    });

    expect(resposta.status).toBe(409);
  });

  test('rejeita cadastro sem campos obrigatórios', async () => {
    const resposta = await request(app).post('/api/auth/cadastro').send({ nome: 'Sem email' });
    expect(resposta.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('a conta ADMIN semeada no init-db consegue logar', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@zerograu.com', senha: 'admin123' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.usuario.perfil).toBe('ADMIN');
    expect(resposta.body.token).toBeTruthy();
  });

  test('rejeita senha incorreta', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@zerograu.com', senha: 'senha-errada' });

    expect(resposta.status).toBe(401);
  });

  test('rejeita email inexistente', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ninguem@zerograu.com', senha: 'qualquer' });

    expect(resposta.status).toBe(401);
  });
});
