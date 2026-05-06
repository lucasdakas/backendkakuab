const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// caminho do banco
const dbPath = path.resolve(__dirname, "../database/database.sqlite");

// cria conexão
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err.message);
  } else {
    console.log("Conectado ao SQLite com sucesso!");
  }
});

module.exports = db;