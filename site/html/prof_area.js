document.addEventListener('DOMContentLoaded', () => {
    const supabaseUrl = 'https://iiplwwaegrofgknpoxtu.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcGx3d2FlZ3JvZmdrbnBveHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0NjQ5NDcsImV4cCI6MjAxNTA0MDk0N30.P23nN_W9wT2l8A0so6_50oQzaR029T3_s0-322IflO8';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Função para verificar a sessão do usuário
    async function checkUserSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            // Se não houver sessão, redireciona para a página de login
            alert("Acesso negado. Por favor, faça o login.");
            window.location.href = '/site/html/teacher_login.html';
        } else {
            // Se houver sessão, exibe o conteúdo da página
            console.log("Login verificado:", session.user.email);
            document.body.style.display = 'block';
        }
    }

    // Função de logout
    window.sair = async function() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Erro ao sair:', error.message);
        } else {
            // Redireciona para a página inicial após o logout
            window.location.href = '/site/html/index.html';
        }
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
    // Verifica a sessão do usuário ao carregar a página
    checkUserSession();
});