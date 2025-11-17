# Documentação da API - Módulo `banco.py`

Este documento detalha as funções disponíveis no módulo `banco.py` para interação com o banco de dados PostgreSQL da aplicação.

## Sumário
1.  Conexão e Configuração
2.  Alunos (Students)
3.  Instituições (Institutions)
4.  Professores (Teachers)
5.  Perguntas (Questions)
6.  Matérias (Subjects)
7.  Conteúdos (Contents)
8.  Autenticação (Login)
9.  Utilitários

---

## 1. Conexão e Configuração

### `create_conn()`
Cria e retorna uma nova conexão com o banco de dados PostgreSQL. Utiliza a URL de conexão definida na variável de ambiente `POSTGRES_URL` ou `DATABASE_URL`.

**Retorna:**
- `psycopg2.connection`: Um objeto de conexão com o banco de dados.

**Levanta (Raises):**
- `Exception`: Se a conexão com o banco de dados falhar.

### `create_all_tables()`
Executa a criação e verificação de todas as tabelas necessárias para a aplicação (`alunos`, `instituicoes`, `professores`, `perguntas`, `conteudos`, `materias`). Garante que o esquema do banco de dados esteja pronto para uso.

---

## 2. Alunos (Students)

### `get_students()`
Busca e retorna uma lista de todos os alunos cadastrados.

**Retorna:**
- `list`: Uma lista de dicionários, onde cada dicionário representa um aluno.

### `add_student(...)`
Adiciona um novo aluno ao banco de dados. A senha é hasheada antes de ser armazenada.

**Argumentos:**

| Parâmetro | Tipo | Descrição | Padrão |
|---|---|---|---|
| `name` | `str` | Nome do aluno. | |
| `age` | `int` | Idade do aluno. | |
| `email` | `str` | Email do aluno (deve ser único). | |
| `password` | `str` | Senha do aluno. | |
| `phone_number` | `str` | Número de telefone. | `'+xx(xxx)xxxxx-xxxx'` |
| `level` | `int` | Nível inicial do aluno. | `1` |
| `xp` | `int` | Pontos de experiência iniciais. | `0` |
| `materias` | `str` | String JSON com a lista de matérias. | `'[]'` |
| `cpf` | `str` | CPF do aluno (deve ser único). | |
| `instituicao` | `str` | Instituição de ensino do aluno. | `'None'` |
| `photo` | `str` | URL para a foto do aluno. | `'None'` |
| `tags` | `str` | String JSON com a lista de tags. | `'[]'` |

**Retorna:**
- `dict`: Um dicionário com `id`, `name` e `email` do aluno criado, ou um dicionário de erro.

### `delete_student(student_id, name)`
Deleta um aluno do banco de dados com base no seu ID e nome.

**Argumentos:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `student_id` | `int` | O ID do aluno a ser deletado. |
| `name` | `str` | O nome do aluno para confirmação. |

---

## 3. Instituições (Institutions)

### `get_institutions()`
Busca e retorna uma lista de todas as instituições cadastradas.

**Retorna:**
- `list`: Uma lista de dicionários, onde cada dicionário representa uma instituição.

### `add_institution(...)`
Adiciona uma nova instituição ao banco de dados.

**Argumentos:**

| Parâmetro | Tipo | Descrição | Padrão |
|---|---|---|---|
| `name` | `str` | Nome da instituição. | |
| `email` | `str` | Email da instituição. | |
| `password` | `str` | Senha para a conta da instituição. | |
| `phone_number` | `str` | Número de telefone. | `'+xx(xxx)xxxxx-xxxx'` |
| `photo` | `str` | URL do logo/foto da instituição. | `'None'` |
| `descricao` | `str` | Descrição da instituição. | `'None'` |
| `cursos` | `str` | String JSON de cursos oferecidos. | `'[]'` |
| `alunos` | `str`| String JSON de alunos associados. | `'[]'` |
| `professores` | `str` | String JSON de professores associados. | `'[]'` |

### `delete_institution(institution_id, name)`
Deleta uma instituição do banco de dados com base no seu ID e nome.

**Argumentos:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `institution_id` | `int` | O ID da instituição a ser deletada. |
| `name` | `str` | O nome da instituição para confirmação. |

---

## 4. Professores (Teachers)

### `add_teacher(...)`
Adiciona um novo professor ao banco de dados.

**Argumentos:**

| Parâmetro | Tipo | Descrição | Padrão |
|---|---|---|---|
| `name` | `str` | Nome do professor. | |
| `email` | `str` | Email do professor (deve ser único). | |
| `password` | `str` | Senha do professor. | |
| `phone_number` | `str` | Número de telefone. | `None` |
| `instituicao` | `str` | Instituição associada. | `None` |
| `photo` | `str` | URL da foto do professor. | `None` |
| `materias` | `str` | String JSON de matérias lecionadas. | `'[]'` |
| `tags` | `str` | String JSON de tags. | `'[]'` |

**Retorna:**
- `dict`: Um dicionário com os dados do professor criado (`id`, `nome`, `email`) ou um dicionário de erro.

---

## 5. Perguntas (Questions)

### `get_questions()`
Busca e retorna todas as perguntas cadastradas.

**Retorna:**
- `list`: Uma lista de dicionários, onde cada dicionário representa uma pergunta.

### `add_question(...)`
Adiciona uma nova pergunta ao banco de dados.

**Argumentos:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `enunciado` | `str` | O texto (enunciado) da pergunta. |
| `opcoes` | `str` | String JSON com as opções de resposta. |
| `resposta_certa` | `str` | A resposta correta para a pergunta. |
| `nivel_dificuldade`| `int` | Nível de dificuldade da pergunta. |
| `materia` | `str` | Matéria a qual a pergunta pertence. |
| `tags` | `str` | String JSON de tags associadas (opcional). |

### `delete_question(question_id)`
Deleta uma pergunta do banco de dados com base no seu ID.

**Argumentos:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `question_id` | `int` | O ID da pergunta a ser deletada. |

---

## 6. Matérias (Subjects)

### `get_materias()`
Busca todas as matérias disponíveis, ordenadas por tipo e nome.

**Retorna:**
- `list`: Uma lista de dicionários, onde cada dicionário representa uma matéria.

---

## 7. Conteúdos (Contents)

### `add_content(...)`
Adiciona um novo conteúdo (material de estudo) associado a um professor.

**Argumentos:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `materia` | `str` | A matéria do conteúdo. |
| `assunto` | `str` | O assunto específico do conteúdo. |
| `descricao` | `str` | Descrição detalhada do conteúdo. |
| `questoes` | `list`| Uma lista de questões (será armazenada como JSONB). |
| `arquivo` | `str` | Caminho ou URL para um arquivo associado. |
| `professor_id` | `int` | ID do professor que está criando o conteúdo. |

**Retorna:**
- `dict`: Dicionário com `id`, `materia` e `assunto` do novo conteúdo, ou um dicionário de erro.

### `get_contents_by_materia(materia_nome)`
Busca todos os conteúdos de uma matéria específica.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `materia_nome` | `str` | O nome da matéria para filtrar os conteúdos. |

**Retorna:**
- `list`: Uma lista de dicionários com os conteúdos encontrados.

### `get_contents_by_teacher(teacher_id)`
Busca todos os conteúdos cadastrados por um professor específico.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `teacher_id` | `int` | O ID do professor. |

**Retorna:**
- `list`: Uma lista de dicionários com os conteúdos do professor.

### `get_content_by_id(content_id)`
Busca os detalhes de um conteúdo específico pelo seu ID.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `content_id` | `int` | O ID do conteúdo. |

**Retorna:**
- `dict` ou `None`: Um dicionário com todos os dados do conteúdo, ou `None` se não for encontrado.

### `update_content(content_id, ...)`
Atualiza um conteúdo existente no banco de dados.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `content_id` | `int` | ID do conteúdo a ser atualizado. |
| `materia` | `str` | Novo nome da matéria. |
| `assunto` | `str` | Novo nome do assunto. |
| `descricao` | `str` | Nova descrição. |
| `questoes` | `list`| Nova lista de questões. |

**Retorna:**
- `dict`: Um dicionário com os dados atualizados do conteúdo, ou um dicionário de erro.

### `delete_content(content_id)`
Deleta um conteúdo específico pelo seu ID.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `content_id` | `int` | O ID do conteúdo a ser deletado. |

**Retorna:**
- `int`: O número de linhas deletadas (1 se sucesso, 0 se falha).

---

## 8. Autenticação (Login)

### `login_student(email, password)`
Autentica um estudante com base no email e senha.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `email` | `str` | O email do estudante. |
| `password` | `str` | A senha do estudante. |

**Retorna:**
- `dict`: Uma mensagem de sucesso com o `student_id`, ou uma mensagem de erro/senha incorreta.

### `login_teacher(email, password)`
Autentica um professor com base no email e senha.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `email` | `str` | O email do professor. |
| `password` | `str` | A senha do professor. |

**Retorna:**
- `dict`: Uma mensagem de sucesso com o `teacher_id`, ou uma mensagem de erro/senha incorreta.

---

## 9. Utilitários

### `check_existence(field, value)`
Verifica se um valor para um campo específico (`email` ou `cpf`) já existe na tabela de alunos.

**Argumentos:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `field` | `str` | O campo a ser verificado ('email' ou 'cpf'). |
| `value` | `str` | O valor a ser procurado. |

**Retorna:**
- `dict`: Um dicionário como `{"exists": True}` ou `{"exists": False}`, ou um dicionário de erro.