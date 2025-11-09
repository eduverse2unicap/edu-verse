document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroProfessorForm');
    const formMessage = document.getElementById('formMessage');
    const senhaInput = document.getElementById('senha');

    if (!form || !formMessage || !senhaInput) {
        console.warn('Elementos do formulário de cadastro de professor não encontrados.');
        return;
    }

    function displayFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message';
        formMessage.classList.add(type === 'success' ? 'form-message-success' : 'form-message-error');
        formMessage.style.display = 'block';
    }

    function validarSenha(senha) {
        const temMaiuscula = /[A-Z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
        const tamanhoMinimo = senha.length >= 8;
        return temMaiuscula && temNumero && temEspecial && tamanhoMinimo;
    }

    senhaInput.addEventListener('input', () => {
        if (validarSenha(senhaInput.value)) {
            senhaInput.style.borderColor = 'green';
        } else {
            senhaInput.style.borderColor = 'red';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validarSenha(senhaInput.value)) {
            displayFormMessage("A senha não atende aos requisitos mínimos de segurança.", 'error');
            return;
        }

        const formData = new FormData(form);
        const teacherData = Object.fromEntries(formData.entries());

        try {
            formMessage.style.display = 'none';

            const response = await fetch('/api/new-teacher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teacherData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Ocorreu um erro ao realizar o cadastro.');
            }

            console.log("✅ Cadastro de professor realizado com sucesso!", result);
            displayFormMessage(`Cadastro de ${result.nome} realizado com sucesso! Você já pode fazer o login.`, 'success');
            form.reset();
            senhaInput.style.borderColor = '#ccc';

        } catch (error) {
            console.error('Falha no processo de cadastro:', error);
            displayFormMessage(error.message, 'error');
        }
    });
});