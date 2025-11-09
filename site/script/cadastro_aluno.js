    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('cadastroAlunoForm');
      const emailInput = document.getElementById('email');
      const cpfInput = document.getElementById('cpf');
      const senhaInput = document.getElementById('senha');
      const senhaErro = document.getElementById('senhaErro');
      const formMessage = document.getElementById('formMessage'); // Trocamos msgSucesso por formMessage
    
      if (!form || !emailInput || !cpfInput || !senhaInput || !senhaErro || !formMessage) {
        console.warn('Elementos do formulário de cadastro não encontrados, abortando script.');
        return;
      }

      // Remove mensagens de erro existentes ao focar no campo
      [emailInput, cpfInput].forEach(input => {
          input.addEventListener('focus', () => removeExistingError(input));
      });

      // Função centralizada para exibir mensagens no formulário
      function displayFormMessage(message, type) {
        formMessage.textContent = message;
        // Limpa classes antigas e adiciona a nova
        formMessage.className = 'form-message';
        if (type === 'success') {
          formMessage.classList.add('form-message-success');
        } else if (type === 'error') {
          formMessage.classList.add('form-message-error');
        }
        formMessage.style.display = 'block';
      }
    
      // Função de verificação de senha forte
      function validarSenha(senha) {
        const temMaiuscula = /[A-Z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
        const tamanhoMinimo = senha.length >= 8;
        return temMaiuscula && temNumero && temEspecial && tamanhoMinimo;
      }

      // Função para verificar se email/cpf já existem
      async function checkFieldExistence(field, value, inputElement) {
        if (!value) return; // Não verifica se o campo estiver vazio
        try {
          const response = await fetch(`/api/check-existence?field=${field}&value=${encodeURIComponent(value)}`);
          if (!response.ok) return; // Falha silenciosamente para não interromper o usuário

          const data = await response.json();
          if (data.exists) {
            // Remove erro antigo antes de adicionar um novo
            removeExistingError(inputElement);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'field-error-message';
            errorMsg.textContent = `Este ${field === 'email' ? 'e-mail' : 'CPF'} já está em uso.`;
            inputElement.insertAdjacentElement('afterend', errorMsg);
            inputElement.style.borderColor = 'red';
          }
        } catch (error) {
          console.error(`Erro ao verificar ${field}:`, error);
        }
      }

      function removeExistingError(inputElement) {
          const nextSibling = inputElement.nextElementSibling;
          if (nextSibling && nextSibling.classList.contains('field-error-message')) {
              nextSibling.remove();
              inputElement.style.borderColor = '#ccc'; // Reseta a cor da borda
          }
      }

      // Adiciona listeners para verificar ao sair do campo (blur)
      emailInput.addEventListener('blur', () => checkFieldExistence('email', emailInput.value, emailInput));
      cpfInput.addEventListener('blur', () => checkFieldExistence('cpf', cpfInput.value, cpfInput));
    
      // Mostrar mensagem de erro ao digitar
      senhaInput.addEventListener('input', () => {
        if (!validarSenha(senhaInput.value)) {
          senhaErro.style.display = 'block';
          senhaInput.style.borderColor = 'red';
        } else {
          senhaErro.style.display = 'none';
          senhaInput.style.borderColor = 'green';
        }
      });
    
      // Envio do formulário
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        if (!validarSenha(senhaInput.value)) {
          senhaErro.style.display = 'block';
          displayFormMessage("A senha não é forte o suficiente. Verifique os requisitos abaixo do campo.", 'error');
          return;
        }

        // 1. Coletar dados do formulário
        const formData = new FormData(form);
        const studentData = Object.fromEntries(formData.entries());

        // Renomeia as chaves para corresponder à API (ex: 'nome' -> 'name')
        const payload = {
            name: studentData.nome,
            idade: parseInt(studentData.idade, 10), // Corrigido de 'age' para 'idade'
            email: studentData.email,
            password: studentData.senha,
            phone_number: studentData.telefone,
            cpf: studentData.cpf,
            instituicao: studentData.instituicao
            // Adicione outros campos conforme necessário
        };

        // 2. Enviar dados para a API Python
        try {
          // Esconde mensagens antigas antes de uma nova submissão
          formMessage.style.display = 'none';

          // URL corrigida para corresponder ao endpoint da API em main.py
          // A Vercel publica os endpoints Python sob o prefixo /api.
          const response = await fetch('/api/new-student', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          // Tenta ler o corpo da resposta como JSON, independentemente do status.
          // Isso é crucial para obter a mensagem de erro do servidor.
          const result = await response.json();

          if (!response.ok) {
            // Se a resposta não for OK, a API FastAPI envia o erro na chave 'detail'.
            const serverMessage = result.detail || `Erro HTTP: ${response.status}`;

            // Deixa a mensagem de erro mais amigável para o usuário
            let friendlyMessage = 'Ocorreu um erro ao realizar o cadastro.';
            if (typeof serverMessage === 'string') {
                if (serverMessage.includes('alunos_cpf_key')) {
                    friendlyMessage = 'O CPF informado já está cadastrado.';
                } else if (serverMessage.includes('alunos_email_key')) {
                    friendlyMessage = 'O e-mail informado já está cadastrado.';
                }
            }
            // Lança um erro com a mensagem específica para ser pego pelo bloco catch.
            throw new Error(friendlyMessage);
          }

          console.log("✅ Cadastro realizado com sucesso!", result);

          // Usa a nova função para exibir a mensagem de sucesso
          displayFormMessage(`Cadastro de ${result.name} realizado com sucesso! Você já pode fazer o login.`, 'success');
          form.reset();
          senhaInput.style.borderColor = '#ccc';

        } catch (error) {
          // Exibe a mensagem de erro específica (seja do servidor ou de rede)
          console.error('Falha no processo de cadastro:', error);
          // Usa a nova função para exibir a mensagem de erro
          displayFormMessage(error.message || 'Não foi possível conectar ao servidor. Verifique sua conexão.', 'error');
        }
      });
    });