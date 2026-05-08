const anuncioModel = require("../models/anuncioModel");

// ── Criar anúncio ─────────────────────────────────────────────────────────────
exports.criar = async (req, res) => {
  const {
    titulo, descricao, categoria,
    unidade_embalagem, marca, moq,
    regiao_atendida, prazo_entrega, formas_contato
  } = req.body;

  if (!titulo || !descricao || !categoria) {
    return res.status(400).json({ error: "Título, descrição e categoria são obrigatórios" });
  }

  try {
    // 1. Buscar id_fornecedor do usuário logado
    const fornecedor = await new Promise((resolve, reject) => {
      anuncioModel.buscarIdFornecedor(req.user.id, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!fornecedor) {
      return res.status(403).json({ error: "Perfil de fornecedor não encontrado" });
    }

    // 2. Buscar id_categoria pelo nome
    const cat = await new Promise((resolve, reject) => {
      anuncioModel.buscarCategoriaPorNome(categoria, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!cat) {
      return res.status(400).json({ error: `Categoria "${categoria}" não encontrada` });
    }

    // 3. Criar anúncio
    const dados = {
      id_fornecedor: fornecedor.id_fornecedor,
      id_categoria: cat.id_categoria,
      titulo, descricao, unidade_embalagem, marca,
      moq, regiao_atendida, prazo_entrega, formas_contato,
      status: "pendente"
    };

    const anuncio = await new Promise((resolve, reject) => {
      anuncioModel.criarAnuncio(dados, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // 4. Salvar imagem se enviada
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await new Promise((resolve) => {
        anuncioModel.salvarImagemAnuncio(anuncio.id_anuncio, imageUrl, resolve);
      });
    }

    return res.status(201).json({
      message: "Anúncio criado com sucesso e enviado para aprovação",
      anuncio
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── Listar todos (admin) ───────────────────────────────────────────────────────
exports.listarTodos = (req, res) => {
  anuncioModel.listarAnuncios((err, anuncios) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(anuncios);
  });
};

// ── Listar públicos ────────────────────────────────────────────────────────────
exports.listarPublicos = (req, res) => {
  anuncioModel.listarAnunciosPublicos((err, anuncios) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(anuncios);
  });
};

// ── Listar categorias ──────────────────────────────────────────────────────────
exports.listarCategorias = (req, res) => {
  anuncioModel.listarCategorias((err, cats) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(cats);
  });
};

// ── Buscar por ID ──────────────────────────────────────────────────────────────
exports.buscarPorId = (req, res) => {
  const { id } = req.params;
  anuncioModel.buscarAnuncioPorId(id, (err, anuncio) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!anuncio) return res.status(404).json({ error: "Anúncio não encontrado" });
    return res.json(anuncio);
  });
};

// ── Meus anúncios (fornecedor) ────────────────────────────────────────────────
exports.meusAnuncios = (req, res) => {
  anuncioModel.listarPorFornecedor(req.user.id, (err, anuncios) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(anuncios);
  });
};

// ── Atualizar anúncio ─────────────────────────────────────────────────────────
exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const {
    titulo, descricao, categoria,
    unidade_embalagem, marca, moq,
    regiao_atendida, prazo_entrega, formas_contato, status
  } = req.body;

  if (!titulo || !descricao || !categoria) {
    return res.status(400).json({ error: "Título, descrição e categoria são obrigatórios" });
  }

  try {
    const cat = await new Promise((resolve, reject) => {
      anuncioModel.buscarCategoriaPorNome(categoria, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!cat) {
      return res.status(400).json({ error: `Categoria "${categoria}" não encontrada` });
    }

    const dados = {
      id_categoria: cat.id_categoria,
      titulo, descricao, unidade_embalagem, marca,
      moq, regiao_atendida, prazo_entrega, formas_contato,
      status: status || "pendente"
    };

    anuncioModel.atualizarAnuncio(id, req.user.id, dados, async (err, resultado) => {
      if (err) return res.status(500).json({ error: err.message });
      if (resultado.alterados === 0) {
        return res.status(404).json({ error: "Anúncio não encontrado ou sem permissão" });
      }

      // Atualizar imagem se enviada
      if (req.file) {
        const imageUrl = `/uploads/${req.file.filename}`;
        anuncioModel.salvarImagemAnuncio(id, imageUrl, () => {});
      }

      return res.json({ message: "Anúncio atualizado com sucesso" });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── Remover anúncio ───────────────────────────────────────────────────────────
exports.remover = (req, res) => {
  const { id } = req.params;
  anuncioModel.removerAnuncio(id, req.user.id, (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultado.removidos === 0) {
      return res.status(404).json({ error: "Anúncio não encontrado ou sem permissão" });
    }
    return res.json({ message: "Anúncio removido com sucesso" });
  });
};
