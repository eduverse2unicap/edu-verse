let arquivoBase64 = null;

// Função para voltar para main.html
function voltarInicio() {
    window.location.href = "/";
}

// Verifica o código do professor
function verificarCodigo() {
    const codigo = document.getElementById("codigoProfessor").value.trim();
    const CODIGO_CORRETO = "prof65"; // Substitua pelo seu código real
    const materiaProfessor = "Matemática"; // Exemplo: a matéria do professor

    if (codigo === CODIGO_CORRETO) {
        document.getElementById("formConteudo").style.display = "block";
        document.getElementById("materia").value = materiaProfessor;
        document.getElementById("msg").innerText = "✅ Código válido! Você pode cadastrar conteúdos.";
    } else {
        alert("❌ Código incorreto! Apenas professores podem adicionar conteúdos.");
        document.getElementById("formConteudo").style.display = "none";
    }
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

// Salvar conteúdo no localStorage
function salvarConteudo() {
    let materia = document.getElementById("materia").value.trim();
    let assunto = document.getElementById("assunto").value.trim();
    let descricao = document.getElementById("descricao").value.trim();
    let questoes = document.getElementById("questoes").value.trim().split("\n").filter(q => q);

    if (!materia || !assunto || (!descricao && !arquivoBase64)) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    let conteudos = JSON.parse(localStorage.getItem("conteudos")) || {};
    if (!conteudos[materia]) conteudos[materia] = [];

    conteudos[materia].push({
        assunto: assunto,
        descricao: descricao,
        questoes: questoes,
        arquivo: arquivoBase64
    });

    localStorage.setItem("conteudos", JSON.stringify(conteudos));

    document.getElementById("msg").innerText = "✅ Conteúdo salvo com sucesso!";
    document.getElementById("assunto").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("questoes").value = "";
    document.getElementById("imagem").value = "";
    document.getElementById("preview").innerHTML = "";
    arquivoBase64 = null;
}