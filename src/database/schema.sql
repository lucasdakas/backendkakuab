CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('fornecedor', 'comprador', 'admin')) NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);