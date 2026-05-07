/* ============================================================
   KAKUAB MARKET — fornecedor.js
   CRUD completo de anúncios consumindo a API real.
   ============================================================ */

function mostrarMsg(texto, tipo = "sucesso") {
  const msg = document.getElementById("msg");
  msg.textContent = texto;
  msg.style.color = tipo === "erro" ? "#9b1c1c" : "#136b2f";
}

function exigirFornecedor() {
  const user = getUser();
  const token = getToken();

  if (!token || !user) {
    window.location.href = "login.html";
    return false;
  }

  if (user.tipo !== "fornecedor") {
    alert("Acesso permitido apenas para fornecedores.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

function idDoAnuncio(anuncio) {
  return anuncio.id || anuncio.id_anuncio;
}

async function carregarMeusAnuncios() {
  const body = document.getElementById("anunciosBody");
  body.innerHTML = `<tr><td colspan="5">Carregando...</td></tr>`;

  try {
    const anuncios = await KakuabAPI.meusAnuncios();

    if (!Array.isArray(anuncios) || anuncios.length === 0) {
      body.innerHTML = `<tr><td colspan="5">Nenhum anúncio cadastrado.</td></tr>`;
      return;
    }

    body.innerHTML = anuncios.map((anuncio) => {
      const id = idDoAnuncio(anuncio);
      return `
        <tr>
          <td>${id}</td>
          <td>${anuncio.titulo || anuncio.nome_produto || "Sem título"}</td>
          <td>${anuncio.categoria || anuncio.nome_categoria || "-"}</td>
          <td><span class="status">${anuncio.status || anuncio.status_anuncio || "pendente"}</span></td>
          <td>
            <button class="btn btn-light" onclick='editarAnuncio(${JSON.stringify(anuncio).replace(/'/g, "&apos;")})'>Editar</button>
            <button class="btn btn-danger" onclick="removerAnuncio(${id})">Remover</button>
          </td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    body.innerHTML = `<tr><td colspan="5">Erro: ${error.message}</td></tr>`;
  }
}

function montarFormData() {
  const formData = new FormData();
  const campos = [
    "titulo",
    "descricao",
    "categoria",
    "unidade_embalagem",
    "marca",
    "moq",
    "regiao_atendida",
    "prazo_entrega",
    "formas_contato"
  ];

  campos.forEach((campo) => {
    formData.append(campo, document.getElementById(campo).value);
  });

  const imagem = document.getElementById("imagem").files[0];
  if (imagem) formData.append("imagem", imagem);

  return formData;
}

async function salvarAnuncio(e) {
  e.preventDefault();
  const id = document.getElementById("anuncioId").value;
  const formData = montarFormData();

  try {
    if (id) {
      await KakuabAPI.atualizarAnuncio(id, formData);
      mostrarMsg("Anúncio atualizado com sucesso!");
    } else {
      await KakuabAPI.criarAnuncio(formData);
      mostrarMsg("Anúncio criado com sucesso! Aguarde aprovação do administrador.");
    }

    limparFormulario();
    carregarMeusAnuncios();
  } catch (error) {
    mostrarMsg(error.message, "erro");
  }
}

function editarAnuncio(anuncio) {
  document.getElementById("formTitle").textContent = "Editar anúncio";
  document.getElementById("anuncioId").value = idDoAnuncio(anuncio);
  document.getElementById("titulo").value = anuncio.titulo || anuncio.nome_produto || "";
  document.getElementById("descricao").value = anuncio.descricao || "";
  document.getElementById("categoria").value = anuncio.categoria || "outros";
  document.getElementById("unidade_embalagem").value = anuncio.unidade_embalagem || "";
  document.getElementById("marca").value = anuncio.marca || "";
  document.getElementById("moq").value = anuncio.moq || "";
  document.getElementById("regiao_atendida").value = anuncio.regiao_atendida || "";
  document.getElementById("prazo_entrega").value = anuncio.prazo_entrega || "";
  document.getElementById("formas_contato").value = anuncio.formas_contato || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function limparFormulario() {
  document.getElementById("formTitle").textContent = "Criar anúncio";
  document.getElementById("anuncioForm").reset();
  document.getElementById("anuncioId").value = "";
}

async function removerAnuncio(id) {
  if (!confirm("Tem certeza que deseja remover este anúncio?")) return;

  try {
    await KakuabAPI.removerAnuncio(id);
    mostrarMsg("Anúncio removido com sucesso!");
    carregarMeusAnuncios();
  } catch (error) {
    mostrarMsg(error.message, "erro");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!exigirFornecedor()) return;
  document.getElementById("anuncioForm").addEventListener("submit", salvarAnuncio);
  carregarMeusAnuncios();
});
