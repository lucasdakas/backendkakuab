const jwt = require("jsonwebtoken");

// Função responsável por gerar o token de autenticação do usuário
function gerarToken(user) {
  // jwt.sign cria um token com informações do usuário
  return jwt.sign(
    {
      // Dados que ficam guardados dentro do token
      id: user.id,
      email: user.email,
      tipo: user.tipo
    },

    // Chave secreta usada para assinar o token
    // Ela vem do arquivo .env
    process.env.JWT_SECRET,

    // Tempo de validade do token
    { expiresIn: "1d" }
  );
}

module.exports = gerarToken;
