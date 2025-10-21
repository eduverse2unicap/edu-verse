// 🔗 Conexão com o Supabase
const supabaseUrl = 'https://iiplwwaegrofgknpoxtu.supabase.co'
// IMPORTANT: Use your ANON KEY, not the service_role key, in the browser.
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key
const { createClient } = window.supabase
const supabase = createClient(supabaseUrl, supabaseKey);

let xp = 0;
let level = 1;
let currentUser = null; // Will hold the logged-in user object

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

function saveUser() {
    // We no longer save user data to localStorage this way.
    // Supabase handles the session. We might save game progress to the database later.
    localStorage.setItem('ranking', JSON.stringify(ranking));
}

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
    saveUser();
}

function updateXP() {
    xpBar.style.width = xp + "%";
    xpText.innerText = xp;
    levelText.innerText = level;
    if (currentUser) {
        let userInRanking = ranking.find(p => p.id === currentUser.id);
        if (userInRanking) {
            userInRanking.xp = level * 100 + xp;
        } else {
            // Add user to ranking if not present
            ranking.push({ id: currentUser.id, name: currentUser.user_metadata.full_name, xp: level * 100 + xp });
        }
    }
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

    saveUser();
}

// This function is now replaced by the form in cadastro_aluno.html
// We will create a login function instead.
async function loginUser() {
    const email = prompt("Digite seu e-mail:");
    const password = prompt("Digite sua senha:");

    if (!email || !password) {
        alert("E-mail e senha são obrigatórios.");
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        console.log("Login successful!", data);
        // The onAuthStateChange listener will handle updating the UI

    } catch (error) {
        alert(`Erro no login: ${error.message}`);
    }
}

async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error);
    } else {
        // The onAuthStateChange listener will reset the UI
        console.log("Logged out successfully.");
        window.location.reload(); // Reload to clear state
    }
}


fetch('materias.json')
    .then(res => res.json())
    .then(data => {
        // Escolar
        const escolarGrid = document.querySelector('#escolar .grid');
        data.escolar.forEach(materia => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = `${materia.icone} ${materia.nome}`;
            card.onclick = () => addXP(materia.xp);
            mostrarAssuntos(materia.nome);
            escolarGrid.appendChild(card);
        });

        // Extras
        const extrasGrid = document.querySelector('#extras .grid');
        data.extras.forEach(materia => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = `${materia.icone} ${materia.nome}`;
            card.onclick = () => addXP(materia.xp);
            extrasGrid.appendChild(card);
        });
    });

// Listen for authentication changes (login, logout)
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        console.log('User signed in:', currentUser);
        // Set user details in the UI
        userNameText.textContent = currentUser.user_metadata.full_name || currentUser.email;
        // TODO: Load user's XP and level from your Supabase database
        // For now, we reset it
        xp = 0;
        level = 1;
        
        // Add user to ranking if not already there
        if (!ranking.find(p => p.id === currentUser.id)) {
            ranking.push({ id: currentUser.id, name: userNameText.textContent, xp: 0 });
        }

        // Hide login/register buttons and show logout button
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';

    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        userNameText.textContent = "Visitante";
        // Hide logout button and show login/register buttons
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
    }
    // Update UI regardless of state
    updateXP();
    updateRanking();
});

// Initial call to set up the UI based on any existing session
updateXP();
updateRanking();

async function carregarMaterias() {
    // Escolar
    const {
        data: materiasEscolar,
        error: err1
    } = await supabase
        .from('materias')
        .select('*')
        .eq('tipo', 'escolar'); // supondo que você tenha coluna "tipo"

    if (err1) return console.error(err1);

    const escolarGrid = document.querySelector('#escolar .grid');
    escolarGrid.innerHTML = "";

    materiasEscolar.forEach(materia => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = `${materia.icone} ${materia.nome}`;
        card.onclick = () => addXP(materia.xp);
        card.onclick = () => mostrarAssuntos(materia.nome);
        escolarGrid.appendChild(card);
    });

    // Extras
    const {
        data: materiasExtras,
        error: err2
    } = await supabase
        .from('materias')
        .select('*')
        .eq('tipo', 'extra');

    if (err2) return console.error(err2);

    const extrasGrid = document.querySelector('#extras .grid');
    extrasGrid.innerHTML = "";

    materiasExtras.forEach(materia => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = `${materia.icone} ${materia.nome}`;
        card.onclick = () => addXP(materia.xp);
        card.onclick = () => mostrarAssuntos(materia.nome);
        extrasGrid.appendChild(card);
    });
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

    const {
        data: conteudos,
        error
    } = await supabase
        .from('conteudos')
        .select('*')
        .eq('materia', materiaNome);

    if (error) {
        console.error(error);
        container.innerHTML = "<p>Erro ao carregar conteúdos.</p>";
        return;
    }

    if (!conteudos || conteudos.length === 0) {
        container.innerHTML = "<p>Sem conteúdos disponíveis.</p>";
        return;
    }

    conteudos.forEach(conteudo => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = `📘 ${conteudo.assunto}`;
        card.onclick = () => mostrarQuestoes(conteudo);
        container.appendChild(card);
    });
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
carregarMaterias();