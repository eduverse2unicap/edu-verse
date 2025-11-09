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

        if (editContentId) {
            loadContentForEditing(editContentId);
        } else {
            msgElement.innerText = `Bem-vindo(a)! Você pode cadastrar novos conteúdos.`;
        }
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

async function loadContentForEditing(id) {
    try {
        const response = await fetch(`/api/content/${id}`);
        if (!response.ok) throw new Error('Conteúdo não encontrado.');

        const content = await response.json();

        // Preenche o formulário com os dados existentes
        document.getElementById("materia").value = content.materia;
        document.getElementById("assunto").value = content.assunto;
        document.getElementById("descricao").value = content.descricao || '';
        document.getElementById("questoes").value = (content.questoes || []).join('\n');

        // Atualiza a UI para o modo de edição
        document.querySelector("h1").textContent = "Editar Conteúdo";
        document.querySelector("#formConteudo button").textContent = "Atualizar Conteúdo";
        msgElement.innerText = `Editando o conteúdo: "${content.assunto}"`;

    } catch (error) {
        console.error('Erro ao carregar conteúdo para edição:', error);
        msgElement.innerText = `❌ Erro: ${error.message}`;
    }
}

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

    // Define o payload, URL e método com base no modo (criação ou edição)
    let url, method, payload;
    if (editContentId) {
        url = `/api/update-content/${editContentId}`;
        method = 'PUT';
        payload = { materia, assunto, descricao, questoes }; // Não envia ID do professor na atualização
    } else {
        url = '/api/new-content';
        method = 'POST';
        payload = { materia, assunto, descricao, questoes, arquivo: arquivoBase64, professor_id: parseInt(teacherId, 10) };
    }

    try {
        const response = await fetch(url, {
            method: method,
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

        const actionText = editContentId ? 'atualizado' : 'salvo';
        msgElement.innerText = `✅ Conteúdo "${result.assunto}" ${actionText} com sucesso!`;
        msgElement.className = 'message-success';

        // Redireciona de volta para a área do professor após o sucesso
        setTimeout(() => {
            window.location.href = '/site/html/prof_area.html';
        }, 2000);

    } catch (error) {
        const actionText = editContentId ? 'atualizar' : 'salvar';
        console.error("Erro ao salvar conteúdo:", error.message);
        msgElement.innerText = `❌ Erro ao ${actionText}: ${error.message}`;
        msgElement.className = 'message-error';
    }
}

// Run the authentication check as soon as the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});