async function apiAdmin(endpoint, options = {}) {
  return apiRequest(`/admin${endpoint}`, options);
}

function exigirAdmin() {
  const user = getUser();
  if (!getToken() || !user) {
    window.location.href = "login.html";
    return false;
  }
  if (user.tipo !== "admin") {
    alert("Acesso permitido apenas para administradores.");
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function getId(anuncio) {
  return anuncio.id || anuncio.id_anuncio;
}

async function carregarPendentes() {
  const body = document.getElementById("pendentesBody");
  body.innerHTML = `<tr><td colspan="4">Carregando...</td></tr>`;
  try {
    const anuncios = await apiAdmin("/anuncios/pendentes");
    if (!Array.isArray(anuncios) || anuncios.length === 0) {
      body.innerHTML = `<tr><td colspan="4">Nenhum anúncio pendente.</td></tr>`;
      return;
    }
    body.innerHTML = anuncios.map(a => {
      const id = getId(a);
      return `<tr>
        <td>${id}</td>
        <td>${a.titulo || a.nome_produto || "Sem título"}</td>
        <td>${a.nome_fornecedor || "-"}</td>
        <td>
          <button class="ok" onclick="aprovar(${id})">Aprovar</button>
          <button class="bad" onclick="reprovar(${id})">Reprovar</button>
        </td>
      </tr>`;
    }).join("");
  } catch (e) {
    body.innerHTML = `<tr><td colspan="4">Erro: ${e.message}</td></tr>`;
  }
}

async function aprovar(id) {
  try {
    await apiAdmin(`/anuncios/${id}/aprovar`, { method: "PATCH" });
    alert("Anúncio aprovado!");
    carregarPendentes();
  } catch (e) { alert(e.message); }
}

async function reprovar(id) {
  const motivo = prompt("Motivo da reprovação:");
  if (!motivo) return;
  try {
    await apiAdmin(`/anuncios/${id}/reprovar`, {
      method: "PATCH",
      body: JSON.stringify({ motivo })
    });
    alert("Anúncio reprovado!");
    carregarPendentes();
  } catch (e) { alert(e.message); }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!exigirAdmin()) return;
  carregarPendentes();
});
