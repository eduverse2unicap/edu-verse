document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('teacherLoginForm');
    const messageEl = document.getElementById('message');

    if (!form) {
        console.error('Teacher login form not found!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = ''; // Clear previous messages
        messageEl.style.color = 'red'; // Default to error color
        
        const email = form.email.value;
        const password = form.password.value;

        try {
            // Faz a requisição para o endpoint de login da API
            const response = await fetch('/api/login-teacher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                // Usa a mensagem de erro vinda da API (ex: "Senha incorreta")
                throw new Error(result.detail || 'Falha no login.');
            }

            // Em caso de sucesso, salva o ID do professor no localStorage para criar uma sessão
            localStorage.setItem('teacher_id', result.teacher_id);
            localStorage.setItem('teacher_email', email); // Salva o email para usar em outras páginas

            console.log('Login successful!', result);
            messageEl.textContent = '✅ Login bem-sucedido! Redirecionando...';
            messageEl.style.color = 'green';

            // Redireciona para a área do professor
            setTimeout(() => {
                window.location.href = '/site/html/prof_area.html'; // Redireciona para o painel principal
            }, 1500);

        } catch (error) {
            // Exibe a mensagem de erro específica vinda da API ou uma genérica
            console.error('Login error:', error.message);
            messageEl.textContent = `❌ ${error.message}`;
        }
    });
});