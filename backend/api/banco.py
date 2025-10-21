import psycopg2
from psycopg2 import Error
from psycopg2.extras import RealDictCursor
import os
import pass_hash
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env para o ambiente
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
        print("Conexão com PostgreSQL bem-sucedida.")
    except Error as e:
        print(f"Erro ao conectar com PostgreSQL: {e}")
    except Exception as e:
        print(f"Erro geral na conexão: {e}")
    return conn

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
    except Error as e:
        print(f"Erro ao criar tabela 'alunos': {e}")

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
    try:
        with conn.cursor() as cursor:
            hashed_password, salt = pass_hash.hash_password(password)
            cursor.execute("""
                INSERT INTO alunos (nome, idade, email, senha, phone_number, level, xp, materias, cpf, instituicao, photo, salt, tags)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (name, age, email, hashed_password, phone_number, level, xp, materias, cpf, instituicao, photo, salt, tags))
            conn.commit()
    except Error as e:
        print(f"Erro ao adicionar aluno: {e}")
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