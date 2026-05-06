CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('fornecedor', 'comprador', 'admin')) NOT NULL,
    status TEXT DEFAULT 'ativo',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS anuncios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT CHECK(categoria IN ('chips', 'castanhas', 'outros')) NOT NULL,
    unidade_embalagem TEXT,
    marca TEXT,
    moq INTEGER,
    regiao_atendida TEXT,
    prazo_entrega TEXT,
    formas_contato TEXT,
    imagem TEXT,
    status TEXT CHECK(status IN ('rascunho', 'pendente', 'ativo', 'pausado', 'reprovado')) DEFAULT 'pendente',
    fornecedor_id INTEGER NOT NULL,
    visualizacoes INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS logs_admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    acao TEXT NOT NULL,
    entidade TEXT,
    entidade_id INTEGER,
    motivo TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comprador_id INTEGER NOT NULL,
    anuncio_id INTEGER NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comprador_id) REFERENCES users(id),
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id),

    UNIQUE(comprador_id, anuncio_id)
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nota INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
    comentario TEXT,
    comprador_id INTEGER NOT NULL,
    anuncio_id INTEGER NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comprador_id) REFERENCES users(id),
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id),

    UNIQUE(comprador_id, anuncio_id)
);
