// ======= TROCA DE ABAS =======
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const tabId = e.target.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    e.target.classList.add("active");
    document.getElementById(tabId).classList.add("active");
  });
});

// ======= GERENCIAMENTO DE ATIVIDADES =======
let atividades = JSON.parse(localStorage.getItem("atividades")) || [];

function salvarAtividade() {
  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const prazo = document.getElementById("prazo").value.trim();

  if (!titulo || !prazo) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  atividades.push({ titulo, descricao, prazo });
  localStorage.setItem("atividades", JSON.stringify(atividades));
  atualizarLista();
  alert("✅ Atividade salva com sucesso!");
  document.getElementById("formAtividade").reset();
}

function atualizarLista() {
  const lista = document.getElementById("lista-atividades");
  lista.innerHTML = "";
  if (atividades.length === 0) {
    lista.innerHTML = "<p>Nenhuma atividade cadastrada ainda.</p>";
    return;
  }

  atividades.forEach((a) => {
    const item = document.createElement("div");
    item.classList.add("card");
    item.innerHTML = `
      <strong>${a.titulo}</strong><br>
      ${a.descricao}<br>
      <small>Prazo: ${a.prazo}</small>
    `;
    lista.appendChild(item);
  });
}

atualizarLista();

// ======= DARK MODE =======
function alternarTema() {
  document.body.classList.toggle("dark");
  const modoEscuroAtivo = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", modoEscuroAtivo);
  document.getElementById("darkModeBtn").innerText = modoEscuroAtivo ? "☀️" : "🌙";
}

// Mantém o tema salvo
window.onload = () => {
  const temaSalvo = JSON.parse(localStorage.getItem("darkMode"));
  if (temaSalvo) {
    document.body.classList.add("dark");
    document.getElementById("darkModeBtn").innerText = "☀️";
  }
};

// ======= SAIR =======
function sair() {
  localStorage.clear();
  window.location.href = "index.html";
}
