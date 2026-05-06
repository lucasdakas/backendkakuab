// Importa a conexão com o banco SQLite
const db = require("../config/database");

// Lista todos os usuários do sistema
// O admin vai usar isso para ver fornecedores, compradores e administradores
function listarUsuarios(callback) {
  const sql = `
    SELECT 
      id,
      nome,
      email,
      tipo,
      status,
      criado_em
    FROM users
    ORDER BY criado_em DESC
  `;

  db.all(sql, [], callback);
}

// Busca um usuário específico pelo ID
// Usamos isso antes de bloquear/desbloquear para saber se o usuário existe
function buscarUsuarioPorId(id, callback) {
  const sql = `
    SELECT 
      id,
      nome,
      email,
      tipo,
      status,
      criado_em
    FROM users
    WHERE id = ?
  `;

  db.get(sql, [id], callback);
}

// Atualiza o status de um usuário
// Pode ser usado para bloquear ou desbloquear
function atualizarStatusUsuario(id, status, callback) {
  const sql = `
    UPDATE users
    SET status = ?
    WHERE id = ?
  `;

  db.run(sql, [status, id], function (err) {
    callback(err, {
      alterados: this.changes
    });
  });
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarStatusUsuario
};
