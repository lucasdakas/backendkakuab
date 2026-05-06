const anuncioModel = require("../models/anuncioModel");

exports.listarPendentes = (req, res) => {
  anuncioModel.listarPendentes((err, anuncios) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(anuncios);
  });
};

exports.aprovarAnuncio = (req, res) => {
  const { id } = req.params;

  anuncioModel.aprovarAnuncio(id, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (resultado.alterados === 0) {
      return res.status(404).json({
        error: "Anúncio não encontrado"
      });
    }

    const log = {
      admin_id: req.user.id,
      acao: "APROVAR_ANUNCIO",
      entidade: "anuncios",
      entidade_id: id,
      motivo: "Anúncio aprovado pela administração"
    };

    anuncioModel.registrarLogAdmin(log, (logErr) => {
      if (logErr) {
        return res.status(500).json({
          error: "Anúncio aprovado, mas houve erro ao registrar log"
        });
      }

      return res.json({
        message: "Anúncio aprovado com sucesso"
      });
    });
  });
};

exports.reprovarAnuncio = (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({
      error: "Informe o motivo da reprovação"
    });
  }

  anuncioModel.reprovarAnuncio(id, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (resultado.alterados === 0) {
      return res.status(404).json({
        error: "Anúncio não encontrado"
      });
    }

    const log = {
      admin_id: req.user.id,
      acao: "REPROVAR_ANUNCIO",
      entidade: "anuncios",
      entidade_id: id,
      motivo
    };

    anuncioModel.registrarLogAdmin(log, (logErr) => {
      if (logErr) {
        return res.status(500).json({
          error: "Anúncio reprovado, mas houve erro ao registrar log"
        });
      }

      return res.json({
        message: "Anúncio reprovado com sucesso",
        motivo
      });
    });
  });
};
