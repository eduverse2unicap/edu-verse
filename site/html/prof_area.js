document.addEventListener('DOMContentLoaded', () => {
    // Função para verificar a sessão local (sem Supabase)
    function checkAuth() {
        const teacherId = localStorage.getItem('teacher_id');
        const teacherEmail = localStorage.getItem('teacher_email');

        if (!teacherId) {
            // Se não houver ID, redireciona para a página de login
            alert("❌ Acesso negado. Por favor, faça o login como professor.");
            window.location.href = '/site/html/teacher_login.html';
        } else {
            // Se houver sessão, exibe o conteúdo da página e personaliza
            console.log(`Login verificado para professor ID: ${teacherId}`);
            document.body.style.display = 'block';
            // Futuramente, você pode usar o teacherEmail para preencher os dados do perfil.
        }
    }

    // Função de logout
    window.sair = function() {
        localStorage.removeItem('teacher_id');
        localStorage.removeItem('teacher_email');
        window.location.href = '/site/html/index.html';
    };

    // Lógica para as abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // Esconde o corpo da página por padrão para evitar piscar
    document.body.style.display = 'none';
    // Verifica a autenticação local ao carregar a página
    checkAuth();
});