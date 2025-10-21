    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('cadastroAlunoForm');
      // You need to initialize Supabase here as well.
      // Make sure this file has access to the Supabase client library.
      const supabaseUrl = 'https://iiplwwaegrofgknpoxtu.supabase.co';
      const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
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
    
        if (!validarSenha(senhaInput.value)) {
          senhaErro.style.display = 'block';
          alert("A senha precisa conter pelo menos:\n- Uma letra maiúscula\n- Um número\n- Um caractere especial\n- E ter no mínimo 8 caracteres.");
          return;
        }

        // 1. Coletar dados
        const email = document.getElementById('email').value.trim();
        const password = senhaInput.value;
        const fullName = document.getElementById('nome').value.trim();
        
        // 2. Usar Supabase Auth para registrar o usuário
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: { 
                full_name: fullName,
                // You can add other metadata here
              }
            }
          });

          if (error) throw error;

          console.log("✅ Cadastro realizado! Verifique seu e-mail para confirmação.", data);
            msgSucesso.style.display = 'block';
            form.reset();
            senhaInput.style.borderColor = '#ccc';
            alert('Cadastro realizado com sucesso! Um link de confirmação foi enviado para o seu e-mail.');

        } catch (error) {
          // Erro de rede
          console.error('Falha na comunicação com a API:', error);
          alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
      });
    });