const anuncioModel = require("../models/anuncioModel");

exports.criar = (req, res) => {
  const {
    titulo,
    descricao,
    categoria,
    unidade_embalagem,
    marca,
    moq,
    regiao_atendida,
    prazo_entrega,
    formas_contato
  } = req.body;

  if (!titulo || !descricao || !categoria) {
    return res.status(400).json({
      error: "Título, descrição e categoria são obrigatórios"
    });
  }

  const categoriasValidas = ["chips", "castanhas", "outros"];

  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({
      error: "Categoria inválida"
    });
  }

  const dados = {
    titulo,
    descricao,
    categoria,
    unidade_embalagem,
    marca,
    moq,
    regiao_atendida,
    prazo_entrega,
    formas_contato,
    imagem: req.file ? req.file.filename : null,
    status: "pendente",
    fornecedor_id: req.user.id
  };

  anuncioModel.criarAnuncio(dados, (err, anuncio) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.status(201).json({
      message: "Anúncio criado com sucesso e enviado para aprovação",
      anuncio
    });
  });
};

exports.listarTodos = (req, res) => {
  anuncioModel.listarAnuncios((err, anuncios) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(anuncios);
  });
};

exports.listarPublicos = (req, res) => {
  anuncioModel.listarAnunciosPublicos((err, anuncios) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(anuncios);
  });
};

exports.buscarPorId = (req, res) => {
  const { id } = req.params;

  anuncioModel.buscarAnuncioPorId(id, (err, anuncio) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!anuncio) {
      return res.status(404).json({
        error: "Anúncio não encontrado"
      });
    }

    return res.json(anuncio);
  });
};

exports.meusAnuncios = (req, res) => {
  anuncioModel.listarPorFornecedor(req.user.id, (err, anuncios) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    return res.json(anuncios);
  });
};

exports.atualizar = (req, res) => {
  const { id } = req.params;

  const {
    titulo,
    descricao,
    categoria,
    unidade_embalagem,
    marca,
    moq,
    regiao_atendida,
    prazo_entrega,
    formas_contato,
    status
  } = req.body;

  if (!titulo || !descricao || !categoria) {
    return res.status(400).json({
      error: "Título, descrição e categoria são obrigatórios"
    });
  }

  const dados = {
    titulo,
    descricao,
    categoria,
    unidade_embalagem,
    marca,
    moq,
    regiao_atendida,
    prazo_entrega,
    formas_contato,
    imagem: req.file ? req.file.filename : null,
    status
  };

  anuncioModel.atualizarAnuncio(id, req.user.id, dados, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (resultado.alterados === 0) {
      return res.status(404).json({
        error: "Anúncio não encontrado ou você não tem permissão"
      });
    }

    return res.json({
      message: "Anúncio atualizado com sucesso"
    });
  });
};

exports.remover = (req, res) => {
  const { id } = req.params;

  anuncioModel.removerAnuncio(id, req.user.id, (err, resultado) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (resultado.removidos === 0) {
      return res.status(404).json({
        error: "Anúncio não encontrado ou você não tem permissão"
      });
    }

    return res.json({
      message: "Anúncio removido com sucesso"
    });
  });
};
