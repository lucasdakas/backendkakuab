// Importa conexão SQLite
const db = require("../config/database");

// Cria uma avaliação para um anúncio
function criarAvaliacao(dados, callback) {
  const sql = `
    INSERT INTO avaliacoes (
      nota,
      comentario,
      comprador_id,
      anuncio_id
    ) VALUES (?, ?, ?, ?)
  `;

  const params = [
    dados.nota,
    dados.comentario,
    dados.comprador_id,
    dados.anuncio_id
  ];

  db.run(sql, params, function (err) {
    callback(err, {
      id: this?.lastID,
      ...dados
    });
  });
}

// Lista avaliações de um anúncio específico
function listarPorAnuncio(anuncioId, callback) {
  const sql = `
    SELECT 
      avaliacoes.*,
      users.nome AS nome_comprador
    FROM avaliacoes
    INNER JOIN users ON users.id = avaliacoes.comprador_id
    WHERE avaliacoes.anuncio_id = ?
    ORDER BY avaliacoes.criado_em DESC
  `;

  db.all(sql, [anuncioId], callback);
}

// Calcula a média de avaliação de um anúncio
function mediaPorAnuncio(anuncioId, callback) {
  const sql = `
    SELECT 
      AVG(nota) AS media,
      COUNT(*) AS total_avaliacoes
    FROM avaliacoes
    WHERE anuncio_id = ?
  `;

  db.get(sql, [anuncioId], callback);
}

// Remove avaliação do próprio comprador
function removerAvaliacao(compradorId, avaliacaoId, callback) {
  const sql = `
    DELETE FROM avaliacoes
    WHERE id = ? AND comprador_id = ?
  `;

  db.run(sql, [avaliacaoId, compradorId], function (err) {
    callback(err, {
      removidos: this.changes
    });
  });
}

module.exports = {
  criarAvaliacao,
  listarPorAnuncio,
  mediaPorAnuncio,
  removerAvaliacao
};
