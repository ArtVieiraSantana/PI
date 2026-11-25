import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Banco de dados local (mobile) usado para cache do carrinho e dos
// produtos consultados, permitindo uso básico offline do app (item 1.5).
const CARRINHO_KEY = '@zerograu_carrinho';
const PRODUTOS_KEY = '@zerograu_produtos_cache';
const isWeb = Platform.OS === 'web';
let dbPromise = null;

function lerJson(chave) {
  const valor = localStorage.getItem(chave);
  return valor ? JSON.parse(valor) : [];
}

function salvarJson(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('zerograu_local.db');
  }
  return dbPromise;
}

export async function iniciarBancoLocal() {
  if (isWeb) return;

  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS produtos_cache (
      id INTEGER PRIMARY KEY,
      nome TEXT,
      preco REAL,
      estoque INTEGER
    );
    CREATE TABLE IF NOT EXISTS carrinho (
      produto_id INTEGER PRIMARY KEY,
      nome TEXT,
      preco REAL,
      quantidade INTEGER,
      imagem_url TEXT
    );
  `);
}

export async function salvarProdutosCache(produtos) {
  if (isWeb) {
    salvarJson(
      PRODUTOS_KEY,
      produtos.map(({ id, nome, preco, estoque }) => ({ id, nome, preco, estoque }))
    );
    return;
  }

  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM produtos_cache');
    for (const p of produtos) {
      await db.runAsync(
        'INSERT INTO produtos_cache (id, nome, preco, estoque) VALUES (?, ?, ?, ?)',
        p.id,
        p.nome,
        p.preco,
        p.estoque
      );
    }
  });
}

export async function adicionarAoCarrinho(produto) {
  if (isWeb) {
    const carrinho = lerJson(CARRINHO_KEY);
    const existente = carrinho.find((item) => item.produto_id === produto.id);

    if (existente) {
      existente.quantidade += 1;
    } else {
      carrinho.push({
        produto_id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: 1,
        imagem_url: produto.imagem_url || null,
      });
    }

    salvarJson(CARRINHO_KEY, carrinho);
    return;
  }

  const db = await getDb();
  const existente = await db.getFirstAsync('SELECT * FROM carrinho WHERE produto_id = ?', produto.id);
  if (existente) {
    await db.runAsync(
      'UPDATE carrinho SET quantidade = quantidade + 1 WHERE produto_id = ?',
      produto.id
    );
  } else {
    await db.runAsync(
      'INSERT INTO carrinho (produto_id, nome, preco, quantidade, imagem_url) VALUES (?, ?, ?, 1, ?)',
      produto.id,
      produto.nome,
      produto.preco,
      produto.imagem_url || null
    );
  }
}

export async function listarCarrinho() {
  if (isWeb) return lerJson(CARRINHO_KEY);

  const db = await getDb();
  return db.getAllAsync('SELECT * FROM carrinho');
}

export async function removerDoCarrinho(produtoId) {
  if (isWeb) {
    salvarJson(
      CARRINHO_KEY,
      lerJson(CARRINHO_KEY).filter((item) => item.produto_id !== produtoId)
    );
    return;
  }

  const db = await getDb();
  await db.runAsync('DELETE FROM carrinho WHERE produto_id = ?', produtoId);
}

// Define a quantidade de um item do carrinho para um valor específico
// (usado pelos botões "+" e "-" da tela de Carrinho). Quantidades menores
// que 1 não são gravadas aqui — a tela de Carrinho trata a remoção (com
// a confirmação do usuário) antes de chamar essa função.
export async function alterarQuantidadeCarrinho(produtoId, novaQuantidade) {
  if (isWeb) {
    const carrinho = lerJson(CARRINHO_KEY);
    const item = carrinho.find((i) => i.produto_id === produtoId);
    if (item) {
      item.quantidade = novaQuantidade;
      salvarJson(CARRINHO_KEY, carrinho);
    }
    return;
  }

  const db = await getDb();
  await db.runAsync(
    'UPDATE carrinho SET quantidade = ? WHERE produto_id = ?',
    novaQuantidade,
    produtoId
  );
}

export async function limparCarrinho() {
  if (isWeb) {
    localStorage.removeItem(CARRINHO_KEY);
    return;
  }

  const db = await getDb();
  await db.runAsync('DELETE FROM carrinho');
}
