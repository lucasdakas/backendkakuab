function roleMiddleware(...tiposPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (!tiposPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({ error: "Acesso negado para este perfil" });
    }

    next();
  };
}

module.exports = roleMiddleware;
