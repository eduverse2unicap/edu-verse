let arquivoBase64 = null;

// --- Supabase Client Initialization ---
// IMPORTANT: You must include the Supabase client library in conteudo.html
// e.g., <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabaseUrl = 'https://iiplwwaegrofgknpoxtu.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


// --- Authentication Check ---
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Error getting session:", error);
        return;
    }

    if (!session) {
        // No user is logged in, redirect to the teacher login page.
        alert("❌ Acesso negado! Você precisa estar logado como professor.");
        window.location.href = '/site/html/teacher_login.html';
    } else {
        // User is logged in, show the form.
        console.log("✅ Acesso permitido para:", session.user.email);
        document.getElementById("formConteudo").style.display = "block";
        document.getElementById("msg").innerText = `Bem-vindo(a), ${session.user.email}! Você pode cadastrar conteúdos.`;
        // You could pre-fill the 'materia' based on teacher's profile data in the future.
        // For now, we'll make it editable.
        document.getElementById("materia").readOnly = false;
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

    if (!materia || !assunto || (!descricao && !arquivoBase64)) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Sua sessão expirou. Faça login novamente.");
        return;
    }

    try {
        const { data, error } = await supabase
            .from('conteudos') // Make sure you have a 'conteudos' table in Supabase
            .insert([{
                materia: materia,
                assunto: assunto,
                descricao: descricao,
                questoes: questoes, // Assumes 'questoes' is a text[] or jsonb column
                arquivo: arquivoBase64, // Assumes 'arquivo' is a text column for base64
                professor_id: user.id // Link content to the logged-in teacher
            }]);

        if (error) throw error;

        document.getElementById("msg").innerText = "✅ Conteúdo salvo com sucesso no banco de dados!";
        document.getElementById("assunto").value = "";
        document.getElementById("descricao").value = "";
        document.getElementById("questoes").value = "";
        document.getElementById("imagem").value = "";
        document.getElementById("preview").innerHTML = "";
        arquivoBase64 = null;

    } catch (error) {
        console.error("Erro ao salvar conteúdo:", error.message);
        document.getElementById("msg").innerText = "❌ Erro ao salvar conteúdo. Tente novamente.";
    }
}

// Run the authentication check as soon as the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});