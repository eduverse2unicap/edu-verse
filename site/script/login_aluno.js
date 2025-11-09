document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('studentLoginForm');
    const messageEl = document.getElementById('message');

    if (!form) {
        console.error('Student login form not found!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = ''; // Limpa mensagens anteriores
        messageEl.className = 'message';

        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await fetch('/api/login-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Falha no login. Verifique suas credenciais.');
            }

            // Sucesso! Salva os dados da sessão no localStorage
            localStorage.setItem('student_id', result.student_id);
            localStorage.setItem('student_email', email); // Salva o email para personalização

            messageEl.textContent = '✅ Login bem-sucedido! Redirecionando...';
            messageEl.className = 'message success';

            setTimeout(() => {
                window.location.href = '/site/html/index.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error.message);
            messageEl.textContent = `❌ ${error.message}`;
            messageEl.className = 'message error';
        }
    });
});