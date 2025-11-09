document.addEventListener('DOMContentLoaded', () => {
    // Função para buscar e exibir os conteúdos do professor
    async function loadTeacherContents(teacherId) {
        const activitiesList = document.getElementById('lista-atividades');
        activitiesList.innerHTML = '<p>Carregando atividades...</p>';

        try {
            const response = await fetch(`/api/teacher-contents/${teacherId}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const contents = await response.json();

            if (contents.length === 0) {
                activitiesList.innerHTML = '<p>Você ainda não cadastrou nenhuma atividade.</p>';
                return;
            }

            activitiesList.innerHTML = ''; // Limpa a mensagem de "carregando"
            const contentList = document.createElement('ul'); // Usaremos uma lista
            contentList.className = 'content-list';

            contents.forEach(content => {
                const listItem = document.createElement('li');
                
                const contentText = document.createElement('span');
                contentText.textContent = `${content.materia} - ${content.assunto}`;

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit-btn';
                editButton.onclick = () => {
                    window.location.href = `/site/html/conteudo.html?edit=${content.id}`;
                };

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.className = 'delete-btn';
                deleteButton.onclick = async () => {
                    if (confirm(`Tem certeza que deseja excluir o conteúdo "${content.assunto}"?`)) {
                        try {
                            const response = await fetch(`/api/delete-content/${content.id}`, {
                                method: 'DELETE',
                            });
                            if (response.ok) {
                                listItem.remove(); // Remove o item da lista na tela
                            } else {
                                alert('Falha ao excluir o conteúdo.');
                            }
                        } catch (error) {
                            console.error('Erro ao deletar:', error);
                            alert('Ocorreu um erro de rede.');
                        }
                    }
                };

                const buttonWrapper = document.createElement('div');
                buttonWrapper.appendChild(editButton);
                buttonWrapper.appendChild(deleteButton);

                listItem.appendChild(contentText);
                listItem.appendChild(buttonWrapper);
                contentList.appendChild(listItem);
            });
            activitiesList.appendChild(contentList);

        } catch (error) {
            console.error('Erro ao buscar conteúdos:', error);
            activitiesList.innerHTML = '<p style="color: red;">Não foi possível carregar suas atividades.</p>';
        }
    }

    // Função para verificar a sessão do usuário (agora baseada no localStorage)
    function checkUserSession() {
        const teacherId = localStorage.getItem('teacher_id');
        if (!teacherId) {
            // Se não houver ID, redireciona para a página de login
            alert("Acesso negado. Por favor, faça o login.");
            window.location.href = '/site/html/teacher_login.html';
        } else {
            // Se houver sessão, exibe o conteúdo da página e personaliza
            console.log(`Login verificado para professor ID: ${teacherId}`);
            document.body.style.display = 'block';
            loadTeacherContents(teacherId); // Carrega os conteúdos do professor
        }
    }

    // Função de logout
    window.sair = function() {
        localStorage.removeItem('teacher_id');
        localStorage.removeItem('teacher_email');
        window.location.href = '/site/html/index.html';
    };

    // ======= TROCA DE ABAS =======
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabId = e.target.dataset.tab;

        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

        e.target.classList.add("active");
        document.getElementById(tabId).classList.add("active");
      });
    });

    // ======= DARK MODE =======
    window.alternarTema = function() {
      document.body.classList.toggle("dark");
      const modoEscuroAtivo = document.body.classList.contains("dark");
      localStorage.setItem("darkMode", modoEscuroAtivo);
      document.getElementById("darkModeBtn").innerText = modoEscuroAtivo ? "☀️" : "🌙";
    }

    // Mantém o tema salvo
    const temaSalvo = JSON.parse(localStorage.getItem("darkMode"));
    if (temaSalvo) {
        document.body.classList.add("dark");
        document.getElementById("darkModeBtn").innerText = "☀️";
    }

    // Esconde o corpo da página por padrão para evitar piscar
    document.body.style.display = 'none';
    // Verifica a autenticação local ao carregar a página
    checkUserSession();
});