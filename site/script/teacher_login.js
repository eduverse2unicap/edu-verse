document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('teacherLoginForm');
    const messageEl = document.getElementById('message');

    // 1. Initialize Supabase Client
    // Make sure your HTML includes the Supabase client library.
    // e.g., <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    const supabaseUrl = 'https://iiplwwaegrofgknpoxtu.supabase.co';
    // IMPORTANT: Use your public ANON KEY, not a secret key, in the browser.
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcGx3d2FlZ3JvZmdrbnBveHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0NjQ5NDcsImV4cCI6MjAxNTA0MDk0N30.P23nN_W9wT2l8A0so6_50oQzaR029T3_s0-322IflO8'; // Chave anônima pública
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    if (!form) {
        console.error('Teacher login form not found!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = ''; // Clear previous messages
        messageEl.style.color = 'red'; // Default to error color

        // 2. Get form data
        const email = form.email.value;
        const password = form.password.value;

        try {
            // 3. Sign in with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }

            // 4. Handle success
            console.log('Login successful!', data);
            messageEl.textContent = '✅ Login bem-sucedido! Redirecionando...';
            messageEl.style.color = 'green';

            // Redirect to the content creation page after a short delay
            setTimeout(() => {
                window.location.href = '/site/html/prof_area.html'; // Redireciona para o painel principal
            }, 1500);

        } catch (error) {
            // 5. Handle errors
            console.error('Login error:', error.message);
            if (error.message.includes('Invalid login credentials')) {
                messageEl.textContent = '❌ E-mail ou senha inválidos.';
            } else {
                messageEl.textContent = '❌ Ocorreu um erro ao tentar fazer login.';
            }
        }
    });
});