/* ============================================================
   KAKUAB MARKET — home-api.js
   Carrega anúncios reais do backend na página inicial.
   ============================================================ */

function imagemDoAnuncio(anuncio) {
  // Sua API segura de imagens usa o ID do anúncio, não a pasta uploads pública.
  if (anuncio.id) return `${API_BASE_URL}/imagens/anuncios/${anuncio.id}`;
  if (anuncio.id_anuncio) return `${API_BASE_URL}/imagens/anuncios/${anuncio.id_anuncio}`;
  return "assets/images/eco-kit.png";
}

function campo(anuncio, ...nomes) {
  for (const nome of nomes) {
    if (anuncio[nome] !== undefined && anuncio[nome] !== null && anuncio[nome] !== "") {
      return anuncio[nome];
    }
  }
  return "";
}

async function carregarAnunciosHome() {
  const grid = document.querySelector(".products-grid");
  if (!grid) return;

  grid.innerHTML = `<p style="grid-column:1/-1;">Carregando anúncios...</p>`;

  try {
    const anuncios = await KakuabAPI.listarAnuncios();

    if (!Array.isArray(anuncios) || anuncios.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;">Nenhum anúncio ativo encontrado.</p>`;
      return;
    }

    grid.innerHTML = anuncios.map((anuncio) => {
      const id = campo(anuncio, "id", "id_anuncio");
      const titulo = campo(anuncio, "titulo", "nome_produto") || "Produto sem título";
      const descricao = campo(anuncio, "descricao") || "Sem descrição cadastrada.";
      const categoria = campo(anuncio, "categoria", "nome_categoria") || "Produto";
      const fornecedor = campo(anuncio, "nome_fornecedor", "fornecedor") || "Fornecedor";

      return `
        <div class="product-card">
          <div class="product-img">
            <img src="${imagemDoAnuncio({ ...anuncio, id })}" alt="${titulo}" onerror="this.src='assets/images/eco-kit.png'">
          </div>
          <div class="product-info">
            <h4>${titulo}</h4>
            <p class="product-desc">${descricao}</p>
            <p class="product-desc"><strong>Categoria:</strong> ${categoria}</p>
            <p class="product-desc"><strong>Fornecedor:</strong> ${fornecedor}</p>
            <button class="product-btn" onclick="favoritarAnuncio(${id})">Favoritar</button>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    grid.innerHTML = `<p style="grid-column:1/-1;color:#9b1c1c;">Erro ao carregar anúncios: ${error.message}</p>`;
  }
}

async function favoritarAnuncio(id) {
  try {
    await KakuabAPI.favoritar(id);
    alert("Anúncio favoritado com sucesso!");
  } catch (error) {
    alert(error.message || "Faça login como comprador para favoritar.");
  }
}

document.addEventListener("DOMContentLoaded", carregarAnunciosHome);
