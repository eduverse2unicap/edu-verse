let xp = 0;
let level = 1;

const xpBar = document.getElementById("xp-progress");
const xpText = document.getElementById("xp");
const levelText = document.getElementById("level");
const userNameText = document.getElementById("user-name");
const rankingList = document.getElementById("ranking-list");

// Ranking inicial
let ranking = JSON.parse(localStorage.getItem('ranking')) || [{
    name: "Alice",
    xp: 50
}, {
    name: "Bob",
    xp: 30
}, {
    name: "Charlie",
    xp: 10
}];

function showTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

function showSubTab(event, subId) {
    document.querySelectorAll('.sub-tab-content').forEach(sub => sub.classList.remove('active'));
    document.querySelectorAll('.sub-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(subId).classList.add('active');
    event.target.classList.add('active');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
}

function rocketJump() {
    const rocket = document.getElementById("rocket");
    rocket.classList.add("jump");
    setTimeout(() => rocket.classList.remove("jump"), 500);
}

function addXP(amount) {
    xp += amount;
    if (xp >= 100) {
        xp -= 100;
        level++;
    }
    updateXP();
    rocketJump();
}

function updateXP() {
    xpBar.style.width = xp + "%";
    xpText.innerText = xp;
    levelText.innerText = level;
    // A lógica de ranking agora é estática ou será atualizada de outra forma
    updateRanking();
}

// Função completa de ranking interativo
function updateRanking() {
    ranking.sort((a, b) => b.xp - a.xp);
    rankingList.innerHTML = "";

    ranking.forEach((p, i) => {
        const tr = document.createElement('tr');

        const posTd = document.createElement('td');
        posTd.textContent = i + 1;
        const nameTd = document.createElement('td');
        nameTd.textContent = p.name;

        const xpTd = document.createElement('td');
        const xpBarContainer = document.createElement('div');
        xpBarContainer.style.maxWidth = "100px"; // Use max-width for flexibility
        xpBarContainer.style.width = "100%";      // Allow it to shrink
        xpBarContainer.style.height = "10px";
        xpBarContainer.style.background = "#ccc";
        xpBarContainer.style.borderRadius = "5px";
        xpBarContainer.style.overflow = "hidden";
        xpBarContainer.style.display = "inline-block";
        xpBarContainer.style.verticalAlign = "middle";

        const xpProgress = document.createElement('div');
        xpProgress.style.height = "100%";
        xpProgress.style.background = "#00c853";
        const levelXP = p.xp % 100;
        xpProgress.style.width = levelXP + "%";

        xpBarContainer.appendChild(xpProgress);

        const xpNumber = document.createElement('span');
        xpNumber.textContent = ` ${p.xp} XP`;
        xpNumber.style.marginLeft = "5px";

        xpTd.appendChild(xpBarContainer);
        xpTd.appendChild(xpNumber);

        const medalTd = document.createElement('td');
        if (i === 0) medalTd.textContent = "🏆";
        else if (i === 1) medalTd.textContent = "🥈";
        else if (i === 2) medalTd.textContent = "🥉";

        tr.appendChild(posTd);
        tr.appendChild(nameTd);
        tr.appendChild(xpTd);
        tr.appendChild(medalTd);

        rankingList.appendChild(tr);
    });

    localStorage.setItem('ranking', JSON.stringify(ranking));
}

// Função para verificar se há um usuário logado (aluno ou professor)
function checkUserSession() {
    const studentId = localStorage.getItem('student_id');
    const studentEmail = localStorage.getItem('student_email');
    const teacherId = localStorage.getItem('teacher_id');
    const teacherEmail = localStorage.getItem('teacher_email');

    const loginSection = document.getElementById('login');
    const logoutBtn = document.getElementById('logoutBtn');

    if (studentId && studentEmail) {
        userNameText.textContent = studentEmail.split('@')[0]; // Mostra o nome do usuário antes do @
        console.log(`Aluno logado: ID ${studentId}`);
        loginSection.style.display = 'none'; // Esconde a seção de login
        logoutBtn.style.display = 'block'; // Mostra o botão de sair
    } else if (teacherId && teacherEmail) {
        userNameText.textContent = `Prof. ${teacherEmail.split('@')[0]}`;
        console.log(`Professor logado: ID ${teacherId}`);
        loginSection.style.display = 'none'; // Esconde a seção de login
        logoutBtn.style.display = 'block'; // Mostra o botão de sair
    } else {
        // Se ninguém estiver logado
        loginSection.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// Função de Logout
function logoutUser() {
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_email');
    localStorage.removeItem('teacher_id');
    localStorage.removeItem('teacher_email');
    window.location.reload(); // Recarrega a página para resetar o estado
}

// Lógica de Login do Formulário do Index
async function handleIndexLogin(event) {
    event.preventDefault();
    const messageEl = document.getElementById('loginMessage');
    messageEl.textContent = '';

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/login-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.detail || 'Falha no login.');
        }

        // Sucesso!
        localStorage.setItem('student_id', result.student_id);
        localStorage.setItem('student_email', email);

        messageEl.textContent = '✅ Login bem-sucedido! Atualizando...';
        messageEl.className = 'message success';
        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        messageEl.textContent = `❌ ${error.message}`;
        messageEl.className = 'message error';
    }
}

// Initial call to set up the UI based on any existing session
updateXP();
updateRanking();

async function carregarMaterias() {
    const escolarGrid = document.querySelector('#escolar .grid');
    const extrasGrid = document.querySelector('#extras .grid');
    escolarGrid.innerHTML = "";
    extrasGrid.innerHTML = "";

    try {
        const response = await fetch('/api/materias');
        if (!response.ok) {
            throw new Error(`Erro ao buscar matérias: ${response.statusText}`);
        }
        const materias = await response.json();

        materias.forEach(materia => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = `${materia.icone} ${materia.nome}`;
            // Adiciona múltiplos eventos de clique
            card.addEventListener('click', () => addXP(materia.xp));
            card.addEventListener('click', () => mostrarAssuntos(materia.nome));

            if (materia.tipo === 'escolar') {
                escolarGrid.appendChild(card);
            } else if (materia.tipo === 'extra') {
                extrasGrid.appendChild(card);
            }
        });

    } catch (error) {
        console.error(error);
        escolarGrid.innerHTML = "<p>Não foi possível carregar as matérias. Tente novamente mais tarde.</p>";
    }
}

// Mostrar assuntos de uma matéria
async function mostrarAssuntos(materiaNome) {
    const containerId = materiaNome.toLowerCase() + "-grid";
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = "grid";
        document.getElementById('areas').appendChild(container);
    }

    container.innerHTML = "";

    try {
        // Chama o novo endpoint da nossa API
        const response = await fetch(`/api/contents/${encodeURIComponent(materiaNome)}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const conteudos = await response.json();

        if (!conteudos || conteudos.length === 0) {
            container.innerHTML = "<p>Sem conteúdos disponíveis para esta matéria.</p>";
            return;
        }

        conteudos.forEach(conteudo => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = `📘 ${conteudo.assunto}`;
            card.onclick = () => mostrarQuestoes(conteudo);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar conteúdos:", error);
        container.innerHTML = "<p>Não foi possível carregar os conteúdos. Tente novamente mais tarde.</p>";
    }
}

// Mostrar questões de um assunto
function mostrarQuestoes(conteudo) {
    const oldContainer = document.querySelector('.questao-container');
    if (oldContainer) oldContainer.remove();

    let index = 0;
    const container = document.createElement('div');
    container.className = 'questao-container';

    const titulo = document.createElement('h3');
    titulo.textContent = conteudo.assunto;

    const questaoText = document.createElement('div');
    questaoText.className = 'questao-text';

    const nav = document.createElement('div');
    nav.className = 'questao-nav';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.onclick = () => {
        if (index > 0) index--;
        atualizarQuestao();
    };

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Próxima';
    nextBtn.onclick = () => {
        if (index < conteudo.questoes.length - 1) index++;
        atualizarQuestao();
    };

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);

    container.appendChild(titulo);
    container.appendChild(questaoText);
    container.appendChild(nav);
    document.getElementById('areas').appendChild(container);

    function atualizarQuestao() {
        questaoText.innerHTML = `<p>${conteudo.questoes[index]}</p>
            <small>Questão ${index + 1} de ${conteudo.questoes.length}</small>`;
    }

    atualizarQuestao();
}

// Chama ao iniciar
checkUserSession(); // Verifica se um usuário já está logado
carregarMaterias();

// Adiciona os listeners para o novo formulário e botão
document.getElementById('indexLoginForm').addEventListener('submit', handleIndexLogin);
document.getElementById('logoutBtn').addEventListener('click', logoutUser);