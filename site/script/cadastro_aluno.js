    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('cadastroAlunoForm');
      const senhaInput = document.getElementById('senha');
      const senhaErro = document.getElementById('senhaErro');
      const msgSucesso = document.getElementById('msgSucesso');
    
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
    
        if (!validarSenha(senhaInput.value)) {
          senhaErro.style.display = 'block';
          alert("A senha precisa conter pelo menos:\n- Uma letra maiúscula\n- Um número\n- Um caractere especial\n- E ter no mínimo 8 caracteres.");
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
            senha: studentData.senha, // Corrigido de 'password' para 'senha'
            phone_number: studentData.telefone,
            cpf: studentData.cpf,
            instituicao: studentData.instituicao
            // Adicione outros campos conforme necessário
        };

        // 2. Enviar dados para a API Python
        try {
          // URL corrigida para corresponder ao endpoint da API em main.py
          // A URL completa (https://edu-verse-main.vercel.app/new-student) é inferida pelo navegador.
          const response = await fetch('/new-student', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log("✅ Cadastro realizado com sucesso!", result);

          msgSucesso.textContent = `Cadastro de ${result.nome} (ID: ${result.id}) realizado com sucesso!`;
          msgSucesso.style.display = 'block';
          form.reset();
          senhaInput.style.borderColor = '#ccc';
          alert('Cadastro realizado com sucesso!');

        } catch (error) {
          // Erro de rede
          console.error('Falha na comunicação com a API:', error);
          alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
      });
    });