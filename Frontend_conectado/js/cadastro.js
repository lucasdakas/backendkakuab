const cadastroPage = document.getElementById("cadastroPage");
const cadastroForm = document.getElementById("cadastroForm");
const tipoSelect = document.getElementById("registerTipo");

const visualTitle = document.getElementById("visualTitle");
const visualText = document.getElementById("visualText");
const cadastroSubtitle = document.getElementById("cadastroSubtitle");

const cnpjInput = document.getElementById("registerCnpj");

// Muda o layout quando trocar comprador/fornecedor
function atualizarLayoutPorTipo() {
  const tipo = tipoSelect.value;

  if (tipo === "fornecedor") {
    cadastroPage.classList.add("fornecedor-mode");

    cadastroSubtitle.textContent = "Cadastre sua empresa e anuncie seus produtos 🌱";

    visualTitle.textContent = "Venda seus produtos para empresas.";
    visualText.textContent =
      "Anuncie alimentos, gerencie seus produtos e conecte sua empresa com compradores B2B.";
  } else {
    cadastroPage.classList.remove("fornecedor-mode");

    cadastroSubtitle.textContent = "Junte-se à comunidade sustentável 🌱";

    visualTitle.textContent = "Compre melhor, negocie com confiança.";
    visualText.textContent =
      "Encontre fornecedores de alimentos, compare anúncios e salve suas melhores oportunidades.";
  }
}

// Máscara simples de CNPJ
function aplicarMascaraCNPJ(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

cnpjInput.addEventListener("input", () => {
  cnpjInput.value = aplicarMascaraCNPJ(cnpjInput.value);
});

// Mostrar/ocultar senha
document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const inputId = button.getAttribute("data-target");
    const input = document.getElementById(inputId);
    const icon = button.querySelector(".material-icons-outlined");

    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "visibility";
    } else {
      input.type = "password";
      icon.textContent = "visibility_off";
    }
  });
});

// Enviar cadastro para o backend
cadastroForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const tipo = tipoSelect.value;
  const cnpj = document.getElementById("registerCnpj").value.trim();
  const razao_social = document.getElementById("registerRazaoSocial").value.trim();
  const nome_fantasia = document.getElementById("registerNomeFantasia").value.trim();
  const senha = document.getElementById("registerPassword").value;
  const confirmarSenha = document.getElementById("confirmPassword").value;

  if (!nome || !email || !tipo || !cnpj || !razao_social || !nome_fantasia || !senha) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  if (cnpj.replace(/\D/g, "").length !== 14) {
    alert("Informe um CNPJ válido com 14 números.");
    return;
  }

  const dadosCadastro = {
    nome,
    email,
    senha,
    tipo,
    cnpj,
    razao_social,
    nome_fantasia
  };

  const botao = cadastroForm.querySelector(".login-btn");
  const textoOriginal = botao.textContent;

  try {
    botao.disabled = true;
    botao.textContent = "Criando conta...";

    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosCadastro)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao cadastrar usuário.");
    }

    alert("Conta criada com sucesso! Faça login para continuar.");
    window.location.href = "login.html";
  } catch (error) {
    alert(error.message);
  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
});

tipoSelect.addEventListener("change", atualizarLayoutPorTipo);

// Inicia no modo comprador
atualizarLayoutPorTipo();