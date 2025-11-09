document.addEventListener('DOMContentLoaded', () => {
    // Função para verificar a sessão do usuário (agora baseada no localStorage)
    function checkUserSession() {
        const teacherId = localStorage.getItem('teacher_id');
        if (!teacherId) {
            // Se não houver ID, redireciona para a página de login
            alert("Acesso negado. Por favor, faça o login.");
            window.location.href = '/site/html/teacher_login.html';
        } else {
            // Se houver sessão, exibe o conteúdo da página
            console.log("Login verificado para teacher_id:", teacherId);
            document.body.style.display = 'block';
        }
    }

    // Função de logout
    window.sair = function() {
        // Remove o ID do professor do localStorage para encerrar a sessão
        localStorage.removeItem('teacher_id');
        console.log("Sessão encerrada.");
        // Redireciona para a página inicial após o logout
        window.location.href = '/site/html/index.html';
    };

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

    // ======= DARK MODE =======
    window.alternarTema = function() {
      document.body.classList.toggle("dark");
      const modoEscuroAtivo = document.body.classList.contains("dark");
      localStorage.setItem("darkMode", modoEscuroAtivo);
      document.getElementById("darkModeBtn").innerText = modoEscuroAtivo ? "☀️" : "🌙";
    }

    // Mantém o tema salvo
    const temaSalvo = JSON.parse(localStorage.getItem("darkMode"));
    if (temaSalvo) {
        document.body.classList.add("dark");
        document.getElementById("darkModeBtn").innerText = "☀️";
    }

    // Esconde o corpo da página por padrão e depois verifica a sessão
    document.body.style.display = 'none';
    checkUserSession();
});
