const db = require("../config/database");

function criarAnuncio(dados, callback) {
  const sql = `
    INSERT INTO anuncios (
      titulo,
      descricao,
      categoria,
      unidade_embalagem,
      marca,
      moq,
      regiao_atendida,
      prazo_entrega,
      formas_contato,
      imagem,
      status,
      fornecedor_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    dados.titulo,
    dados.descricao,
    dados.categoria,
    dados.unidade_embalagem,
    dados.marca,
    dados.moq,
    dados.regiao_atendida,
    dados.prazo_entrega,
    dados.formas_contato,
    dados.imagem,
    dados.status || "pendente",
    dados.fornecedor_id
  ];

  db.run(sql, params, function (err) {
    callback(err, { id: this?.lastID, ...dados });
  });
}

function listarAnuncios(callback) {
  const sql = `
    SELECT 
      anuncios.*,
      users.nome AS nome_fornecedor,
      users.email AS email_fornecedor
    FROM anuncios
    INNER JOIN users ON users.id = anuncios.fornecedor_id
    ORDER BY anuncios.criado_em DESC
  `;

  db.all(sql, [], callback);
}

function listarAnunciosPublicos(callback) {
  const sql = `
    SELECT 
      anuncios.*,
      users.nome AS nome_fornecedor
    FROM anuncios
    INNER JOIN users ON users.id = anuncios.fornecedor_id
    WHERE anuncios.status = 'ativo'
    ORDER BY anuncios.criado_em DESC
  `;

  db.all(sql, [], callback);
}

function buscarAnuncioPorId(id, callback) {
  const sql = `
    SELECT 
      anuncios.*,
      users.nome AS nome_fornecedor,
      users.email AS email_fornecedor
    FROM anuncios
    INNER JOIN users ON users.id = anuncios.fornecedor_id
    WHERE anuncios.id = ?
  `;

  db.get(sql, [id], callback);
}

function listarPorFornecedor(fornecedorId, callback) {
  const sql = `
    SELECT *
    FROM anuncios
    WHERE fornecedor_id = ?
    ORDER BY criado_em DESC
  `;

  db.all(sql, [fornecedorId], callback);
}

function atualizarAnuncio(id, fornecedorId, dados, callback) {
  const sql = `
    UPDATE anuncios
    SET 
      titulo = ?,
      descricao = ?,
      categoria = ?,
      unidade_embalagem = ?,
      marca = ?,
      moq = ?,
      regiao_atendida = ?,
      prazo_entrega = ?,
      formas_contato = ?,
      imagem = COALESCE(?, imagem),
      status = ?,
      atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ? AND fornecedor_id = ?
  `;

  const params = [
    dados.titulo,
    dados.descricao,
    dados.categoria,
    dados.unidade_embalagem,
    dados.marca,
    dados.moq,
    dados.regiao_atendida,
    dados.prazo_entrega,
    dados.formas_contato,
    dados.imagem,
    dados.status || "pendente",
    id,
    fornecedorId
  ];

  db.run(sql, params, function (err) {
    callback(err, { alterados: this.changes });
  });
}

function removerAnuncio(id, fornecedorId, callback) {
  const sql = `
    DELETE FROM anuncios
    WHERE id = ? AND fornecedor_id = ?
  `;

  db.run(sql, [id, fornecedorId], function (err) {
    callback(err, { removidos: this.changes });
  });
}

function alterarStatusAnuncio(id, status, callback) {
  const sql = `
    UPDATE anuncios
    SET status = ?, atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [status, id], function (err) {
    callback(err, { alterados: this.changes });
  });
}
function listarPendentes(callback) {
  const sql = `
    SELECT 
      anuncios.*,
      users.nome AS nome_fornecedor,
      users.email AS email_fornecedor
    FROM anuncios
    INNER JOIN users ON users.id = anuncios.fornecedor_id
    WHERE anuncios.status = 'pendente'
    ORDER BY anuncios.criado_em DESC
  `;

  db.all(sql, [], callback);
}

function aprovarAnuncio(id, callback) {
  const sql = `
    UPDATE anuncios
    SET status = 'ativo', atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [id], function (err) {
    callback(err, { alterados: this.changes });
  });
}

function reprovarAnuncio(id, callback) {
  const sql = `
    UPDATE anuncios
    SET status = 'reprovado', atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [id], function (err) {
    callback(err, { alterados: this.changes });
  });
}

function registrarLogAdmin(dados, callback) {
  const sql = `
    INSERT INTO logs_admin (
      admin_id,
      acao,
      entidade,
      entidade_id,
      motivo
    ) VALUES (?, ?, ?, ?, ?)
  `;

  const params = [
    dados.admin_id,
    dados.acao,
    dados.entidade,
    dados.entidade_id,
    dados.motivo || null
  ];

  db.run(sql, params, function (err) {
    callback(err, { id: this?.lastID });
  });
}

module.exports = {
  criarAnuncio,
  listarAnuncios,
  listarAnunciosPublicos,
  buscarAnuncioPorId,
  listarPorFornecedor,
  atualizarAnuncio,
  removerAnuncio,
  alterarStatusAnuncio,
  listarPendentes,
 aprovarAnuncio,
  reprovarAnuncio,
  registrarLogAdmin
};
