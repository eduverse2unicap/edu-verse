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
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = senhaInput.value.trim();
    
        if (!validarSenha(senha)) {
          senhaErro.style.display = 'block';
          alert("A senha precisa conter pelo menos:\n- Uma letra maiúscula\n- Um número\n- Um caractere especial\n- E ter no mínimo 8 caracteres.");
          return;
        }
    
        // Aqui você pode enviar para o Supabase (substituindo o localStorage)
        const novoAluno = { nome, email, senha };
        console.log("✅ Aluno cadastrado:", novoAluno);
    
        msgSucesso.style.display = 'block';
        form.reset();
        senhaInput.style.borderColor = '#ccc';
      });
    });