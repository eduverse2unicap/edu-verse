import sqlite3
from sqlite3 import Error
import os, pass_hash

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'db.db')

def create_conn():
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        print("Connection successful")
    except Error as e:
        print(f"Error: {e}")
    return conn

def create_table_students(conn):
    try:
        
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alunos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                idade INTEGER NOT NULL,
                email TEXT UNIQUE,
                senha TEXT NOT NULL,
                phone_number TEXT DEFAULT '+xx(xxx)xxxxx-xxxx',
                level INTEGER NOT NULL DEFAULT 1,
                xp INTEGER NOT NULL DEFAULT 0,
                materias TEXT DEFAULT '[]',
                cpf TEXT UNIQUE,
                instituicao TEXT DEFAULT 'None',
                photo TEXT DEFAULT 'None',
                salt TEXT NOT NULL,
                tags TEXT DEFAULT '[]'
            )
        """)
        conn.commit()
        ensure_student_table_columns(conn)
    except Error as e:
        print(f"Error: {e}")
    finally:
        pass

def ensure_student_table_columns(conn):
    """Add any missing columns to the alunos table.

    This is idempotent: it queries PRAGMA table_info and only issues
    ALTER TABLE ADD COLUMN for columns that don't exist.
    """
    try:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info('alunos')")
        existing = [row[1] for row in cursor.fetchall()]

        expected_columns = {
            'phone_number': "TEXT DEFAULT '+xx(xxx)xxxxx-xxxx'",
            'email': "TEXT UNIQUE",
            'level': "INTEGER NOT NULL DEFAULT 1",
            'xp': "INTEGER NOT NULL DEFAULT 0",
            'materias': "TEXT DEFAULT '[]'",
            'cpf': "TEXT UNIQUE",
            'instituicao': "TEXT DEFAULT 'None'",
            'photo': "TEXT DEFAULT 'None'",
            'salt': "TEXT",
            'tags': "TEXT DEFAULT '[]'"
        }

        for col, col_def in expected_columns.items():
            if col not in existing:
                try:
                    sql = f"ALTER TABLE alunos ADD COLUMN {col} {col_def}"
                    cursor.execute(sql)
                    conn.commit()
                    print(f"Added missing column {col} to alunos table")
                except Error as e:
                    print(f"Could not add column {col}: {e}")
    except Error as e:
        print(f"Error checking/ensuring aluno columns: {e}")

#instituitions
def create_table_institutions(conn):
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS instituicoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT,
                senha TEXT NOT NULL,
                phone_number TEXT DEFAULT '+xx(xxx)xxxxx-xxxx',
                photo TEXT DEFAULT 'None',
                descricao TEXT DEFAULT 'None',
                cursos TEXT DEFAULT '[]',
                alunos TEXT DEFAULT '[]',
                professores TEXT DEFAULT '[]',
                salt TEXT
            )
        """)
        conn.commit()
    except Error as e:
        print(f"Error: {e}")

def get_students():
    conn = create_conn()
    students = []
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alunos")
        rows = cursor.fetchall()
        for row in rows:
            r = dict(row)
            students.append({
                "id": r.get("id"),
                "nome": r.get("nome"),
                "idade": r.get("idade"),
                "email": r.get("email"),
                "phone_number": r.get("phone_number", "+xx(xxx)xxxxx-xxxx"),
                "level": r.get("level", 1),
                "xp": r.get("xp", 0),
                "materias": r.get("materias", "[]"),
                "cpf": r.get("cpf"),
                "instituicao": r.get("instituicao", "None"),
                "photo": r.get("photo", "None"),
                "tags": r.get("tags", "[]")
            })
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
    return students

def add_student(name, age, email, password, phone_number='+xx(xxx)xxxxx-xxxx', level=1, xp=0, materias='[]', cpf=None, instituicao='None', photo='None', salt='', tags='[]'):
    conn = create_conn()
    try:
        cursor = conn.cursor()
        hashedAndSalt = pass_hash.hash_password(password)
        #print(hashedAndSalt) ## only for debugging
        hashed_password = hashedAndSalt[0]
        salt = hashedAndSalt[1]
        cursor.execute("""
            INSERT INTO alunos (nome, idade, email, senha, phone_number, level, xp, materias, cpf, instituicao, photo, salt, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, age, email, hashed_password, phone_number, level, xp, materias, cpf, instituicao, photo, salt, tags))
        conn.commit()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

def get_institutions():
    conn = create_conn()
    institutions = []
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM instituicoes")
        rows = cursor.fetchall()
        for row in rows:
            
            r = dict(row)
            institutions.append({
                "id": r.get("id"),
                "nome": r.get("nome"),
                "email": r.get("email"),
                "phone_number": r.get("phone_number", "+xx(xxx)xxxxx-xxxx"),
                "photo": r.get("photo", "None"),
                "description": r.get("descricao", "None"),
                "cursos": r.get("cursos", "[]"),
                "alunos": r.get("alunos", "[]"),
                "professores": r.get("professores", "[]")
            })
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
    return institutions

def add_institution(name, email, password, phone_number='+xx(xxx)xxxxx-xxxx', photo='None', descricao='None', cursos='[]', alunos='[]', professores='[]'):
    conn = create_conn()
    try:
        hashedAndSalt = pass_hash.hash_password(password)
        hashed_password = hashedAndSalt[0]
        salt = hashedAndSalt[1]
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO instituicoes (nome, email, senha, phone_number, photo, descricao, cursos, alunos, professores, salt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, email, hashed_password, phone_number, photo, descricao, cursos, alunos, professores, salt))
        conn.commit()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()


## content from cursos

def create_table_questions(conn):
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS perguntas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                enunciado TEXT NOT NULL,
                opcoes TEXT NOT NULL,
                resposta_certa TEXT NOT NULL,
                nivel_dificuldade INTEGER NOT NULL,
                materia TEXT NOT NULL,
                tags TEXT DEFAULT '[]'
            )
        """)
        conn.commit()
    except Error as e:
        print(f"Error: {e}")

def ensure_questions_table_columns(conn):
    """Add any missing columns to the alunos table.
    This is idempotent: it queries PRAGMA table_info and only issues
    ALTER TABLE ADD COLUMN for columns that don't exist.
    """
    try:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info('perguntas')")
        existing = [row[1] for row in cursor.fetchall()]

        expected_columns = {
            'enunciado': "TEXT NOT NULL",
            'opcoes': "TEXT NOT NULL",
            'resposta_certa': "TEXT NOT NULL",
            'nivel_dificuldade': "INTEGER NOT NULL",
            'materia': "TEXT NOT NULL",
            'tags': "TEXT DEFAULT '[]'"
        }

        for col, col_def in expected_columns.items():
            if col not in existing:
                try:
                    sql = f"ALTER TABLE perguntas ADD COLUMN {col} {col_def}"
                    cursor.execute(sql)
                    conn.commit()
                    print(f"Added missing colum {col} to perguntas table")
                except Error as e:
                    print(f"Could not add column {col}: {e}")
    except Error as e:
        print(f"Error checking/ensuring perguntas columns: {e}")



def get_questions():
    conn = create_conn()
    questions = []
    try:
        cursor = conn.cursor()
        create_table_questions(conn)
        ensure_questions_table_columns(conn)
        cursor.execute("SELECT * FROM perguntas")
        rows = cursor.fetchall()
        for row in rows:
            r = dict(row)
            questions.append({
                "id": r.get("id"),
                "enunciado": r.get("enunciado"),
                "opcoes": r.get("opcoes"),
                "resposta_certa": r.get("resposta_certa"),
                "nivel_dificuldade": r.get("nivel_dificuldade"),
                "materia": r.get("materia"),
                "tags": r.get("tags", "[]")
            })
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
    return questions