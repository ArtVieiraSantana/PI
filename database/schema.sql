-- =====================================================================
-- ZeroGrau Mobile - PI IV (Desenvolvimento para Dispositivos Móveis)
-- Script SQL de criação do banco de dados
-- Item 1.5 do roteiro: Modelagem, Estrutura do Banco de Dados e NODE
-- =====================================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    senha_hash    TEXT NOT NULL,
    perfil        TEXT NOT NULL DEFAULT 'CLIENTE' CHECK (perfil IN ('CLIENTE', 'ADMIN')),
    criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categorias (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT NOT NULL UNIQUE,
    slug          TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS produtos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT NOT NULL,
    descricao       TEXT,
    preco           DECIMAL(10,2) NOT NULL,
    estoque         INTEGER NOT NULL DEFAULT 0,
    sku             TEXT UNIQUE,
    imagem_url      TEXT,
    ativo           INTEGER NOT NULL DEFAULT 1,
    categoria_id    INTEGER,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em   TEXT,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_pedido   TEXT NOT NULL UNIQUE,
    usuario_id      INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'PENDENTE'
                    CHECK (status IN ('PENDENTE','PAGO','ENVIADO','ENTREGUE','CANCELADO')),
    subtotal        DECIMAL(10,2) NOT NULL,
    frete           DECIMAL(10,2) NOT NULL DEFAULT 0,
    total           DECIMAL(10,2) NOT NULL,
    forma_pagamento TEXT,
    mp_payment_id   TEXT,
    endereco_entrega TEXT,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id       INTEGER NOT NULL,
    produto_id      INTEGER NOT NULL,
    quantidade      INTEGER NOT NULL,
    preco_unitario  DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos (id)
);

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido (pedido_id);

-- Dados iniciais (seed) para testes do app
INSERT OR IGNORE INTO categorias (id, nome, slug) VALUES
    (1, 'Vestuário', 'vestuario'),
    (2, 'Acessórios', 'acessorios');

INSERT OR IGNORE INTO produtos (id, nome, descricao, preco, estoque, sku, imagem_url, categoria_id) VALUES
    (1, 'Camiseta ZeroGrau', 'Camiseta em algodão premium', 79.90, 50, 'ZG-CAM-001', 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&q=80&auto=format&fit=crop', 1),
    (2, 'Boné ZeroGrau', 'Boné ajustável bordado', 49.90, 30, 'ZG-BON-001', 'https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?w=600&q=80&auto=format&fit=crop', 2),
    (3, 'Moletom ZeroGrau', 'Moletom canguru em algodão macio', 159.90, 20, 'ZG-MOL-001', 'https://images.unsplash.com/photo-1499971856191-1a420a42b498?w=600&q=80&auto=format&fit=crop', 1);
