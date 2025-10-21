    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('cadastroAlunoForm');
      const senhaInput = document.getElementById('senha');
      const senhaErro = document.getElementById('senhaErro');
      const msgSucesso = document.getElementById('msgSucesso');
    
      // Se algum elemento não existir, aborta para evitar erros de runtime
      if (!form || !senhaInput || !senhaErro || !msgSucesso) {
        console.warn('Elementos do formulário de cadastro não encontrados, abortando script.');
        return;
      }
    
      // Função de verificação de senha forte
      function validarSenha(senha) {
        const temMaiuscula = /[A-Z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
        const tamanhoMinimo = senha.length >= 8;
        return temMaiuscula && temNumero && temEspecial && tamanhoMinimo;
      }
    
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
    
        if (!validarSenha(senha)) {
          senhaErro.style.display = 'block';
          alert("A senha precisa conter pelo menos:\n- Uma letra maiúscula\n- Um número\n- Um caractere especial\n- E ter no mínimo 8 caracteres.");
          return;
        }

        // 1. Coletar os dados do formulário
        const studentData = {
          name: document.getElementById('nome').value.trim(),
          idade: parseInt(document.getElementById('idade').value, 10), // Certifique-se de que existe um input com id="idade"
          email: document.getElementById('email').value.trim(),
          senha: senhaInput.value.trim(),
          cpf: document.getElementById('cpf').value.trim(), // Certifique-se de que existe um input com id="cpf"
        };

        // 2. Enviar os dados para a API
        try {
          // O endpoint da API é relativo: /api/new-student
          // A Vercel saberá como redirecionar para sua função Python.
          const response = await fetch('/api/new-student', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
          });

          if (response.ok) {
            // Sucesso!
            console.log("✅ Aluno cadastrado com sucesso!");
            msgSucesso.style.display = 'block';
            form.reset();
            senhaInput.style.borderColor = '#ccc';
          } else {
            // Erro do servidor
            const errorData = await response.json();
            alert(`Erro ao cadastrar: ${errorData.detail || 'Erro desconhecido'}`);
          }
        } catch (error) {
          // Erro de rede
          console.error('Falha na comunicação com a API:', error);
          alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
      });
    });