const db = require("../config/database");
const { gerarHash, compararSenha } = require("../utils/hash");
const gerarToken = require("../utils/token");

// 📌 CADASTRO
exports.register = async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    // validação básica
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    // verifica tipo válido
    const tiposValidos = ["fornecedor", "comprador", "admin"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    // criptografa senha
    const senhaHash = await gerarHash(senha);

    // insere no banco
    const sql = `
      INSERT INTO users (nome, email, senha, tipo)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [nome, email, senhaHash, tipo], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Email já cadastrado" });
        }
        return res.status(500).json({ error: err.message });
      }

      return res.status(201).json({
        message: "Usuário criado com sucesso",
        userId: this.lastID
      });
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor" });
  }
};

// 🔑 LOGIN
exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha email e senha" });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;

  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    // compara senha
    const senhaValida = await compararSenha(senha, user.senha);

    if (!senhaValida) {
      return res.status(400).json({ error: "Senha inválida" });
    }

    // gera token
    const token = gerarToken(user);

    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      }
    });
  });
};