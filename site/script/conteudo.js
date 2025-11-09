let arquivoBase64 = null;
const msgElement = document.getElementById("msg");

// --- Authentication Check ---
function checkAuth() {
    // Verifica se o ID do professor está salvo no localStorage após o login
    const teacherId = localStorage.getItem('teacher_id');
    const teacherEmail = localStorage.getItem('teacher_email');

    if (!teacherId) {
        // No user is logged in, redirect to the teacher login page.
        alert("❌ Acesso negado! Você precisa estar logado como professor.");
        window.location.href = '/site/html/teacher_login.html';
    } else {
        // User is logged in, show the form.
        console.log(`✅ Acesso permitido para professor ID: ${teacherId}`);
        document.getElementById("formConteudo").style.display = "block";
        msgElement.innerText = `Bem-vindo(a), ${teacherEmail || 'Professor(a)'}! Você pode cadastrar novos conteúdos.`;
        msgElement.className = 'message-info';
    }
}

// Função para voltar para main.html
function voltarInicio() {
    window.location.href = "/site/html/index.html";
}

// Pré-visualização da imagem
document.getElementById("imagem").addEventListener("change", function() {
    const preview = document.getElementById("preview");
    preview.innerHTML = "";
    if (this.files.length > 0) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(this.files[0]);
        preview.appendChild(img);

        const reader = new FileReader();
        reader.onload = () => arquivoBase64 = reader.result;
        reader.readAsDataURL(this.files[0]);
    }
});

// Salvar conteúdo no Supabase
async function salvarConteudo() {
    let materia = document.getElementById("materia").value.trim();
    let assunto = document.getElementById("assunto").value.trim();
    let descricao = document.getElementById("descricao").value.trim();
    let questoes = document.getElementById("questoes").value.trim().split("\n").filter(q => q);
    const teacherId = localStorage.getItem('teacher_id');

    if (!materia || !assunto || (!descricao && !arquivoBase64)) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    if (!teacherId) {
        alert("Sua sessão expirou. Faça login novamente.");
        window.location.href = '/site/html/teacher_login.html';
        return;
    }

    const payload = {
        materia: materia,
        assunto: assunto,
        descricao: descricao,
        questoes: questoes,
        arquivo: arquivoBase64,
        professor_id: parseInt(teacherId, 10)
    };

    try {
        const response = await fetch('/api/new-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            // Lança um erro para ser pego pelo bloco catch
            throw new Error(result.detail || `Erro HTTP: ${response.status}`);
        }

        msgElement.innerText = `✅ Conteúdo "${result.assunto}" salvo com sucesso!`;
        msgElement.className = 'message-success';

        // Limpa o formulário
        document.getElementById("assunto").value = "";
        document.getElementById("descricao").value = "";
        document.getElementById("questoes").value = "";
        document.getElementById("imagem").value = "";
        document.getElementById("preview").innerHTML = "";
        arquivoBase64 = null;
        
        // Esconde a mensagem de sucesso após alguns segundos
        setTimeout(() => { msgElement.innerText = ''; msgElement.className = ''; }, 5000);

    } catch (error) {
        console.error("Erro ao salvar conteúdo:", error.message);
        msgElement.innerText = `❌ Erro ao salvar: ${error.message}`;
        msgElement.className = 'message-error';
    }
}

// Run the authentication check as soon as the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});