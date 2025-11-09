import psycopg2, urllib, httplib2
from psycopg2 import Error
from psycopg2.extras import RealDictCursor
import os
from . import pass_hash
from dotenv import load_dotenv



# Carrega as variáveis do arquivo .env para o ambiente
http = httplib2.Http()
load_dotenv()
# A Vercel injeta a variável como POSTGRES_URL. Para outros provedores, pode ser DATABASE_URL.
# Usamos 'POSTGRES_URL' como prioridade.
DATABASE_URL = os.environ.get('POSTGRES_URL') or os.environ.get('DATABASE_URL')

def create_conn():
    """Cria e retorna uma conexão com o banco de dados PostgreSQL."""
    conn = None
    try:
        if not DATABASE_URL:
            raise Exception("Variável de ambiente POSTGRES_URL (ou DATABASE_URL) não encontrada.")
        conn = psycopg2.connect(DATABASE_URL)
    except Error as e:
        print(f"Erro ao conectar com PostgreSQL: {e}")
        raise e  # Lança a exceção para que o chamador saiba que a conexão falhou
    except Exception as e:
        print(f"Erro geral na conexão: {e}")
        raise e  # Lança a exceção
    return conn

def ensure_student_table_columns(conn):
    """Garante que a tabela 'alunos' tenha todas as colunas esperadas."""
    expected_columns = {
        'phone_number': "TEXT DEFAULT '+xx(xxx)xxxxx-xxxx'",
        'level': "INTEGER NOT NULL DEFAULT 1",
        'xp': "INTEGER NOT NULL DEFAULT 0",
        'materias': "TEXT DEFAULT '[]'",
        'cpf': "TEXT UNIQUE NOT NULL",
        'instituicao': "TEXT DEFAULT 'None'",
        'photo': "TEXT DEFAULT 'None'",
        'salt': "TEXT NOT NULL",
        'tags': "TEXT DEFAULT '[]'"
    }
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alunos'")
            existing_columns = [row[0] for row in cursor.fetchall()]

            for col_name, col_def in expected_columns.items():
                if col_name not in existing_columns:
                    cursor.execute(f"ALTER TABLE alunos ADD COLUMN {col_name} {col_def}")
                    print(f"Coluna '{col_name}' adicionada à tabela 'alunos'.")
            conn.commit()
    except Error as e:
        print(f"Erro ao verificar/atualizar colunas de 'alunos': {e}")

def create_table_students(conn):
    """Cria a tabela 'alunos' se ela não existir."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alunos (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                idade INTEGER NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                phone_number TEXT DEFAULT '+xx(xxx)xxxxx-xxxx',
                level INTEGER NOT NULL DEFAULT 1,
                xp INTEGER NOT NULL DEFAULT 0,
                materias TEXT DEFAULT '[]',
                cpf TEXT UNIQUE NOT NULL,
                instituicao TEXT DEFAULT 'None',
                photo TEXT DEFAULT 'None',
                salt TEXT NOT NULL,
                tags TEXT DEFAULT '[]'
            )
        """)
        conn.commit()
        print("Tabela 'alunos' pronta.")
        ensure_student_table_columns(conn)
    except Error as e:
        print(f"Erro ao criar tabela 'alunos': {e}")

def ensure_institution_table_columns(conn):
    """Garante que a tabela 'instituicoes' tenha todas as colunas esperadas."""
    expected_columns = {
        'phone_number': "TEXT DEFAULT '+xx(xxx)xxxxx-xxxx'",
        'photo': "TEXT DEFAULT 'None'",
        'descricao': "TEXT DEFAULT 'None'",
        'cursos': "TEXT DEFAULT '[]'",
        'alunos': "TEXT DEFAULT '[]'",
        'professores': "TEXT DEFAULT '[]'",
        'salt': "TEXT NOT NULL"
    }
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'instituicoes'")
            existing_columns = [row[0] for row in cursor.fetchall()]
            for col_name, col_def in expected_columns.items():
                if col_name not in existing_columns:
                    cursor.execute(f"ALTER TABLE instituicoes ADD COLUMN {col_name} {col_def}")
                    print(f"Coluna '{col_name}' adicionada à tabela 'instituicoes'.")
            conn.commit()
    except Error as e:
        print(f"Erro ao verificar/atualizar colunas de 'instituicoes': {e}")

def create_table_institutions(conn):
    """Cria a tabela 'instituicoes' se ela não existir."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS instituicoes (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                email TEXT,
                senha TEXT NOT NULL,
                phone_number TEXT DEFAULT '+xx(xxx)xxxxx-xxxx',
                photo TEXT DEFAULT 'None',
                descricao TEXT DEFAULT 'None',
                cursos TEXT DEFAULT '[]',
                alunos TEXT DEFAULT '[]',
                professores TEXT DEFAULT '[]',
                salt TEXT NOT NULL
            )
        """)
        conn.commit()
        print("Tabela 'instituicoes' pronta.")
        ensure_institution_table_columns(conn)
    except Error as e:
        print(f"Erro ao criar tabela 'instituicoes': {e}")

def get_students():
    conn = create_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM alunos")
            students = cursor.fetchall()
        return students
    except Error as e:
        print(f"Erro ao buscar alunos: {e}")
        return []
    finally:
        if conn:
            conn.close()

def add_student(name, age, email, password, phone_number='+xx(xxx)xxxxx-xxxx', level=1, xp=0, materias='[]', cpf=None, instituicao='None', photo='None', salt='', tags='[]'):
    conn = create_conn()
    if not conn:
        return {"error": "Falha ao estabelecer conexão com o banco de dados."}
    try:
        with conn.cursor() as cursor:
            hashed_password, salt = pass_hash.hash_password(password)
            # Adicionamos RETURNING id para obter o ID do novo aluno
            cursor.execute("""
                INSERT INTO alunos (nome, idade, email, senha, phone_number, level, xp, materias, cpf, instituicao, photo, salt, tags)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """, (name, age, email, hashed_password, phone_number, level, xp, materias, cpf, instituicao, photo, salt, tags))
            student_id = cursor.fetchone()[0]
            conn.commit()
            # Retorna um dicionário com os dados do aluno criado
            return {"id": student_id, "name": name, "email": email}
    except Error as e:
        print(f"Erro ao adicionar aluno: {e}")
        if conn:
            conn.rollback() # Desfaz a transação falha para evitar erros subsequentes.
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

def delete_student(student_id: int, name: str):
    conn = create_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM alunos WHERE id = %s AND nome = %s", (student_id, name))
            conn.commit()
    except Error as e:
        print(f"Erro ao deletar aluno: {e}")
    finally:
        if conn:
            conn.close()

def get_institutions():
    conn = create_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM instituicoes")
            rows = cursor.fetchall()
        # Renomeia 'descricao' para 'description' para corresponder ao modelo da API
        institutions = [{**row, 'description': row.pop('descricao', None)} for row in rows]
        return institutions
    except Error as e:
        print(f"Erro ao buscar instituições: {e}")
        return []
    finally:
        if conn:
            conn.close()

def add_institution(name, email, password, phone_number='+xx(xxx)xxxxx-xxxx', photo='None', descricao='None', cursos='[]', alunos='[]', professores='[]'):
    conn = create_conn()
    if not conn:
        return {"error": "Falha ao estabelecer conexão com o banco de dados."}
    try:
        with conn.cursor() as cursor:
            hashed_password, salt = pass_hash.hash_password(password)
            cursor.execute("""
                INSERT INTO instituicoes (nome, email, senha, phone_number, photo, descricao, cursos, alunos, professores, salt)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (name, email, hashed_password, phone_number, photo, descricao, cursos, alunos, professores, salt))
            conn.commit()
    except Error as e:
        print(f"Erro ao adicionar instituição: {e}")
    finally:
        if conn:
            conn.close()

def delete_institution(institution_id: int, name: str):
    conn = create_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM instituicoes WHERE id = %s AND nome = %s", (institution_id, name))
            conn.commit()
    except Error as e:
        print(f"Erro ao deletar instituição: {e}")
    finally:
        if conn:
            conn.close()

def ensure_question_table_columns(conn):
    """Garante que a tabela 'perguntas' tenha todas as colunas esperadas."""
    expected_columns = {
        'nivel_dificuldade': 'INTEGER NOT NULL',
        'materia': 'TEXT NOT NULL',
        'tags': "TEXT DEFAULT '[]'"
    }
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'perguntas'")
            existing_columns = [row[0] for row in cursor.fetchall()]
            for col_name, col_def in expected_columns.items():
                if col_name not in existing_columns:
                    cursor.execute(f"ALTER TABLE perguntas ADD COLUMN {col_name} {col_def}")
                    print(f"Coluna '{col_name}' adicionada à tabela 'perguntas'.")
            conn.commit()
    except Error as e:
        print(f"Erro ao verificar/atualizar colunas de 'perguntas': {e}")

def create_table_questions(conn):
    """Cria a tabela 'perguntas' se ela não existir."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS perguntas (
                id SERIAL PRIMARY KEY,
                enunciado TEXT NOT NULL,
                opcoes TEXT NOT NULL,
                resposta_certa TEXT NOT NULL,
                nivel_dificuldade INTEGER NOT NULL,
                materia TEXT NOT NULL,
                tags TEXT DEFAULT '[]'
            )
        """)
        conn.commit()
        print("Tabela 'perguntas' pronta.")
        ensure_question_table_columns(conn)
    except Error as e:
        print(f"Erro ao criar tabela 'perguntas': {e}")

def get_questions():
    conn = create_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM perguntas")
            questions = cursor.fetchall()
        return questions
    except Error as e:
        print(f"Erro ao buscar perguntas: {e}")
        return []
    finally:
        if conn:
            conn.close()

def add_question(enunciado, opcoes, resposta_certa, nivel_dificuldade, materia, tags='[]'):
    conn = create_conn()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO perguntas (enunciado, opcoes, resposta_certa, nivel_dificuldade, materia, tags)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (enunciado, opcoes, resposta_certa, nivel_dificuldade, materia, tags))
            conn.commit()
    except Error as e:
        print(f"Erro ao adicionar pergunta: {e}")
    finally:
        if conn:
            conn.close()

def delete_question(question_id: int, enunciado: str, tag: str = '[]'):
    conn = create_conn()
    try:
        with conn.cursor() as cursor:
            # A 'tag' não estava sendo usada corretamente, removi para evitar erros.
            # A deleção por ID geralmente é suficiente e mais segura.
            cursor.execute("DELETE FROM perguntas WHERE id = %s", (question_id,))
            conn.commit()
    except Error as e:
        print(f"Erro ao deletar pergunta: {e}")
    finally:
        if conn:
            conn.close()

def create_all_tables():
    conn = create_conn()
    if conn:
        create_table_students(conn)
        ensure_student_table_columns(conn)
        create_table_institutions(conn)
        ensure_institution_table_columns(conn)
        create_table_questions(conn)
        ensure_question_table_columns(conn)
        # A criação da tabela de professores agora vem ANTES da de conteúdos
        create_table_teachers(conn)
        create_table_contents(conn)
        create_table_materias(conn)
        conn.close()

def create_table_materias(conn):
    """Cria e popula a tabela 'materias' se ela não existir."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS materias (
                    id SERIAL PRIMARY KEY,
                    nome TEXT NOT NULL,
                    icone TEXT,
                    xp INTEGER DEFAULT 10,
                    tipo TEXT NOT NULL -- 'escolar' ou 'extra'
                );
            """)
            conn.commit()
            print("Tabela 'materias' pronta.")

            # Verifica se a tabela está vazia antes de popular
            cursor.execute("SELECT COUNT(*) FROM materias")
            if cursor.fetchone()[0] == 0:
                print("Populando tabela 'materias' com dados iniciais...")
                initial_materias = [
                    ('Matemática', '📘', 10, 'escolar'), ('Ciências', '📗', 10, 'escolar'),
                    ('História', '📙', 10, 'escolar'), ('Português', '📕', 10, 'escolar'),
                    ('Geografia', '📘', 10, 'escolar'), ('Física', '📗', 10, 'escolar'),
                    ('Química', '📙', 10, 'escolar'), ('Tecnologia', '💻', 15, 'extra'),
                    ('Saúde', '❤️', 15, 'extra'), ('Artes', '🎨', 15, 'extra'),
                    ('Música', '🎵', 15, 'extra'), ('Esportes', '🤸', 15, 'extra')
                ]
                cursor.executemany(
                    "INSERT INTO materias (nome, icone, xp, tipo) VALUES (%s, %s, %s, %s)",
                    initial_materias
                )
                conn.commit()
                print("Tabela 'materias' populada.")
    except Error as e:
        print(f"Erro ao criar/popular tabela 'materias': {e}")

def get_materias():
    """Busca todas as matérias do banco de dados."""
    conn = create_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM materias ORDER BY tipo, nome")
            materias = cursor.fetchall()
        return materias
    except Error as e:
        print(f"Erro ao buscar matérias: {e}")
        return []
    finally:
        if conn:
            conn.close()

def ensure_teacher_table_columns(conn):
    """Garante que a tabela 'professores' tenha todas as colunas esperadas."""
    expected_columns = {
        'phone_number': "TEXT DEFAULT '+xx(xxx)xxxxx-xxxx'",
        'instituicao': "TEXT DEFAULT 'None'",
        'photo': "TEXT DEFAULT 'None'",
        'salt': "TEXT NOT NULL",
        'materias': "TEXT DEFAULT '[]'",
        'tags': "TEXT DEFAULT '[]'"
    }
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'professores'")
            existing_columns = [row[0] for row in cursor.fetchall()]
            for col_name, col_def in expected_columns.items():
                if col_name not in existing_columns:
                    cursor.execute(f"ALTER TABLE professores ADD COLUMN {col_name} {col_def}")
                    print(f"Coluna '{col_name}' adicionada à tabela 'professores'.")
            conn.commit()
    except Error as e:
        print(f"Erro ao verificar/atualizar colunas de 'professores': {e}")

def create_table_teachers(conn):
    """Cria a tabela 'professores' se ela não existir."""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS professores (
                    id SERIAL PRIMARY KEY,
                    nome TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    senha TEXT NOT NULL,
                    phone_number TEXT DEFAULT '+xx(xxx)xxxxx-xxxx',
                    instituicao TEXT DEFAULT 'None',
                    photo TEXT DEFAULT 'None',
                    salt TEXT NOT NULL,
                    materias TEXT DEFAULT '[]',
                    tags TEXT DEFAULT '[]'
                )
            """)
        conn.commit()
        print("Tabela 'professores' pronta.")
        ensure_teacher_table_columns(conn)
    except Error as e:
        print(f"Erro ao criar tabela 'professores': {e}")

def add_teacher(name, email, password, phone_number=None, instituicao=None, photo=None, materias='[]', tags='[]'):
    """Adiciona um novo professor ao banco de dados."""
    conn = create_conn()
    if not conn:
        return {"error": "Falha na conexão com o banco de dados."}
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            hashed_password, salt = pass_hash.hash_password(password)
            cursor.execute("""
                INSERT INTO professores (nome, email, senha, phone_number, instituicao, photo, salt, materias, tags)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, nome, email;
            """, (name, email, hashed_password, phone_number, instituicao, photo, salt, materias, tags))
            new_teacher = cursor.fetchone()
            conn.commit()
            return new_teacher
    except Error as e:
        print(f"Erro ao adicionar professor: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

def create_table_contents(conn):
    """Cria a tabela 'conteudos' se ela não existir."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conteudos (
                    id SERIAL PRIMARY KEY,
                    materia TEXT NOT NULL,
                    assunto TEXT NOT NULL,
                    descricao TEXT,
                    questoes JSONB,
                    arquivo TEXT,
                    professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL
                );
            """)
            conn.commit()
            print("Tabela 'conteudos' pronta.")
    except Error as e:
        print(f"Erro ao criar tabela 'conteudos': {e}")

def add_content(materia: str, assunto: str, descricao: str, questoes: list, arquivo: str, professor_id: int):
    """Adiciona um novo conteúdo ao banco de dados."""
    conn = create_conn()
    if not conn:
        return {"error": "Falha na conexão com o banco de dados."}
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                INSERT INTO conteudos (materia, assunto, descricao, questoes, arquivo, professor_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, materia, assunto;
            """, (materia, assunto, descricao, questoes, arquivo, professor_id))
            new_content = cursor.fetchone()
            conn.commit()
            return new_content
    except Error as e:
        print(f"Erro ao adicionar conteúdo: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

def get_contents_by_materia(materia_nome: str):
    """Busca todos os conteúdos de uma matéria específica."""
    conn = create_conn()
    if not conn:
        return []
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Seleciona apenas os campos necessários para a lista de assuntos
            cursor.execute("SELECT id, materia, assunto, questoes FROM conteudos WHERE materia = %s", (materia_nome,))
            contents = cursor.fetchall()
            return contents
    except Error as e:
        print(f"Erro ao buscar conteúdos por matéria: {e}")
        return []
    finally:
        if conn:
            conn.close()

def login_student(email, password):
    conn = create_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, senha, salt FROM alunos WHERE email = %s", (email,))
            student_data = cursor.fetchone()
            if student_data:
                stored_hash = student_data['senha']
                stored_salt = student_data['salt']
                if pass_hash.verify_password(password, stored_hash, stored_salt):
                    return {"message": "Login de estudante bem-sucedido", "student_id": student_data['id']}
                else:
                    return {"message": "Senha incorreta"}
            else:
                return {"message": "Estudante não encontrado"}
    except Error as e:
        print(f"Erro ao fazer login do estudante: {e}")
        return {"message": "Erro interno do servidor"}
    finally:
        if conn:
            conn.close()

def login_teacher(email, password):
    conn = create_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, senha, salt FROM professores WHERE email = %s", (email,))
            teacher_data = cursor.fetchone()
            if teacher_data:
                stored_hash = teacher_data['senha']
                stored_salt = teacher_data['salt']
                if pass_hash.verify_password(password, stored_hash, stored_salt):
                    return {"message": "Login de professor bem-sucedido", "teacher_id": teacher_data['id']}
                else:
                    return {"message": "Senha incorreta"}
            else:
                return {"message": "Professor não encontrado"}
    except Error as e:
        print(f"Erro ao fazer login do professor: {e}")
        return {"message": "Erro interno do servidor"}
    finally:
        if conn:
            conn.close()

def get_contents_by_teacher(teacher_id: int):
    """Busca todos os conteúdos cadastrados por um professor específico."""
    conn = create_conn()
    if not conn:
        return []
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT id, materia, assunto FROM conteudos WHERE professor_id = %s ORDER BY materia, assunto",
                (teacher_id,)
            )
            contents = cursor.fetchall()
            return contents
    except Error as e:
        print(f"Erro ao buscar conteúdos do professor: {e}")
        return []
    finally:
        if conn:
            conn.close()

def delete_content(content_id: int):
    """Deleta um conteúdo específico pelo seu ID e retorna o número de linhas afetadas."""
    conn = create_conn()
    if not conn:
        return 0
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM conteudos WHERE id = %s", (content_id,))
            deleted_rows = cursor.rowcount
            conn.commit()
            return deleted_rows
    except Error as e:
        print(f"Erro ao deletar conteúdo: {e}")
        if conn:
            conn.rollback()
        return 0
    finally:
        if conn:
            conn.close()

def get_content_by_id(content_id: int):
    """Busca os detalhes de um conteúdo específico pelo seu ID."""
    conn = create_conn()
    if not conn:
        return None
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM conteudos WHERE id = %s", (content_id,))
            content = cursor.fetchone()
            return content
    except Error as e:
        print(f"Erro ao buscar conteúdo por ID: {e}")
        return None
    finally:
        if conn:
            conn.close()

def update_content(content_id: int, materia: str, assunto: str, descricao: str, questoes: list):
    """Atualiza um conteúdo existente no banco de dados."""
    conn = create_conn()
    if not conn:
        return {"error": "Falha na conexão com o banco de dados."}
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE conteudos
                SET materia = %s, assunto = %s, descricao = %s, questoes = %s
                WHERE id = %s
                RETURNING id, materia, assunto;
            """, (materia, assunto, descricao, questoes, content_id))
            updated_content = cursor.fetchone()
            conn.commit()
            if not updated_content:
                return {"error": "Conteúdo não encontrado para atualizar."}
            return updated_content
    except Error as e:
        print(f"Erro ao atualizar conteúdo: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

def check_existence(field: str, value: str):
    """Verifica se um valor para um campo específico (email ou cpf) já existe na tabela de alunos."""
    conn = create_conn()
    if not conn:
        return {"error": "Falha na conexão com o banco de dados", "exists": None}

    # Validação para evitar SQL Injection no nome do campo
    if field not in ['email', 'cpf']:
        return {"error": "Campo de verificação inválido", "exists": None}

    try:
        with conn.cursor() as cursor:
            # Usar f-string para o nome da coluna é seguro aqui por causa da validação acima
            query = f"SELECT EXISTS(SELECT 1 FROM alunos WHERE {field} = %s)"
            cursor.execute(query, (value,))
            exists = cursor.fetchone()[0]
            return {"exists": exists}
    except Error as e:
        print(f"Erro ao verificar existência de {field}: {e}")
        return {"error": str(e), "exists": None}
    finally:
        if conn:
            conn.close()