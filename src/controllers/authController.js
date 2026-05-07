// Importa a conexão com o banco SQLite
const db = require("../config/database");

// Importa as funções para criptografar e comparar senha
const { gerarHash, compararSenha } = require("../utils/hash");

// Importa a função que gera o token JWT
const gerarToken = require("../utils/token");

// Função auxiliar para gerar o próximo ID manualmente
// Isso é necessário porque seu banco usa INT PRIMARY KEY, não AUTOINCREMENT
function gerarProximoId(tabela, coluna) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COALESCE(MAX(${coluna}), 0) + 1 AS proximoId FROM ${tabela}`;

    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.proximoId);
      }
    });
  });
}

// Função auxiliar para buscar usuário pelo email
function buscarUsuarioPorEmail(email) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM usuarios
      WHERE email = ?
    `;

    db.get(sql, [email], (err, usuario) => {
      if (err) {
        reject(err);
      } else {
        resolve(usuario);
      }
    });
  });
}

// Função auxiliar para inserir usuário
function inserirUsuario({ id_usuario, nome, email, senha_hash, tipo_usuario }) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO usuarios (
        id_usuario,
        nome,
        email,
        senha_hash,
        tipo_usuario,
        ativo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id_usuario,
      nome,
      email,
      senha_hash,
      tipo_usuario,
      1
    ];

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id_usuario,
          nome,
          email,
          tipo_usuario,
          ativo: 1
        });
      }
    });
  });
}

// Função auxiliar para criar registro de fornecedor
function inserirFornecedor({ id_fornecedor, id_usuario, razao_social, nome_fantasia }) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO fornecedores (
        id_fornecedor,
        id_usuario,
        razao_social,
        nome_fantasia,
        bloqueado
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      id_fornecedor,
      id_usuario,
      razao_social,
      nome_fantasia,
      0
    ];

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id_fornecedor,
          id_usuario,
          razao_social,
          nome_fantasia,
          bloqueado: 0
        });
      }
    });
  });
}

// Função auxiliar para criar registro de comprador
function inserirComprador({ id_comprador, id_usuario, razao_social }) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO compradores (
        id_comprador,
        id_usuario,
        razao_social,
        bloqueado
      ) VALUES (?, ?, ?, ?)
    `;

    const params = [
      id_comprador,
      id_usuario,
      razao_social,
      0
    ];

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id_comprador,
          id_usuario,
          razao_social,
          bloqueado: 0
        });
      }
    });
  });
}

// CADASTRO
exports.register = async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      tipo,
      razao_social,
      nome_fantasia
    } = req.body;

    // Validação dos campos principais
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({
        error: "Preencha nome, email, senha e tipo"
      });
    }

    // Tipos permitidos no banco
    const tiposValidos = ["fornecedor", "comprador", "admin"];

    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        error: "Tipo inválido. Use fornecedor, comprador ou admin."
      });
    }

    // Verifica se o email já existe
    const usuarioExistente = await buscarUsuarioPorEmail(email);

    if (usuarioExistente) {
      return res.status(400).json({
        error: "Email já cadastrado"
      });
    }

    // Criptografa a senha antes de salvar
    const senhaHash = await gerarHash(senha);

    // Gera o próximo id_usuario manualmente
    const idUsuario = await gerarProximoId("usuarios", "id_usuario");

    // Insere o usuário na tabela usuarios
    const usuarioCriado = await inserirUsuario({
      id_usuario: idUsuario,
      nome,
      email,
      senha_hash: senhaHash,
      tipo_usuario: tipo
    });

    // Se for fornecedor, cria também o registro na tabela fornecedores
    if (tipo === "fornecedor") {
      const idFornecedor = await gerarProximoId("fornecedores", "id_fornecedor");

      await inserirFornecedor({
        id_fornecedor: idFornecedor,
        id_usuario: idUsuario,
        razao_social: razao_social || nome,
        nome_fantasia: nome_fantasia || nome
      });
    }

    // Se for comprador, cria também o registro na tabela compradores
    if (tipo === "comprador") {
      const idComprador = await gerarProximoId("compradores", "id_comprador");

      await inserirComprador({
        id_comprador: idComprador,
        id_usuario: idUsuario,
        razao_social: razao_social || nome
      });
    }

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      user: {
        id: usuarioCriado.id_usuario,
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        tipo: usuarioCriado.tipo_usuario,
        ativo: usuarioCriado.ativo
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// LOGIN
exports.login = (req, res) => {
  const { email, senha } = req.body;

  // Verifica se email e senha foram enviados
  if (!email || !senha) {
    return res.status(400).json({
      error: "Preencha email e senha"
    });
  }

  const sql = `
    SELECT *
    FROM usuarios
    WHERE email = ?
  `;

  db.get(sql, [email], async (err, usuario) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!usuario) {
      return res.status(400).json({
        error: "Usuário não encontrado"
      });
    }

    // Verifica se o usuário está ativo
    if (usuario.ativo === 0) {
      return res.status(403).json({
        error: "Usuário bloqueado. Entre em contato com a administração."
      });
    }

    // Compara a senha digitada com o hash salvo no banco
    const senhaValida = await compararSenha(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(400).json({
        error: "Senha inválida"
      });
    }

    // Objeto padronizado para gerar o token
    const usuarioParaToken = {
      id: usuario.id_usuario,
      email: usuario.email,
      tipo: usuario.tipo_usuario
    };

    const token = gerarToken(usuarioParaToken);

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo_usuario,
        ativo: usuario.ativo
      }
    });
  });
};

// PERFIL DO USUÁRIO LOGADO
exports.me = (req, res) => {
  const usuarioId = req.user.id;

  const sql = `
    SELECT 
      id_usuario,
      nome,
      email,
      tipo_usuario,
      ativo,
      data_criacao
    FROM usuarios
    WHERE id_usuario = ?
  `;

  db.get(sql, [usuarioId], (err, usuario) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    return res.json({
      user: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo_usuario,
        ativo: usuario.ativo,
        data_criacao: usuario.data_criacao
      }
    });
  });
};
