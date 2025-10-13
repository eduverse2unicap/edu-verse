import sqlite3
from sqlite3 import Error
import os, pass_hash

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'db.db')

def create_conn():
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        # return rows as mapping-like objects so we can access by column name
        conn.row_factory = sqlite3.Row
        print("Connection successful")
    except Error as e:
        print(f"Error: {e}")
    return conn
def create_table_students(conn):
    try:
        ##you can create a colum to salt on the password pls
        
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
                salt TEXT NOT NULL
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
#im getting: Error: table alunos has no column named email

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
        }

        for col, col_def in expected_columns.items():
            if col not in existing:
                try:
                    sql = f"ALTER TABLE alunos ADD COLUMN {col} {col_def}"
                    cursor.execute(sql)
                    conn.commit()
                    print(f"Added missing column {col} to alunos table")
                except Error as e:
                    # If adding fails (e.g., UNIQUE on existing data), print and continue
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
                professores TEXT DEFAULT '[]'
            )
        """)
        conn.commit()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

def get_students():
    conn = create_conn()
    students = []
    try:
        create_table_students(conn)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alunos")
        rows = cursor.fetchall()
        for row in rows:
            # convert Row to dict and use .get with defaults so missing columns
            # (older DB schemas) don't cause IndexError
            r = dict(row)
            students.append({
                "id": r.get("id"),
                "nome": r.get("nome"),
                "idade": r.get("idade"),
                "email": r.get("email"),
                #"senha": r.get("senha"),
                "phone_number": r.get("phone_number", "+xx(xxx)xxxxx-xxxx"),
                "level": r.get("level", 1),
                "xp": r.get("xp", 0),
                "materias": r.get("materias", "[]"),
                "cpf": r.get("cpf"),
                "instituicao": r.get("instituicao", "None"),
                "photo": r.get("photo", "None")
            })
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
    return students

def add_student(name, age, email, password, phone_number='+xx(xxx)xxxxx-xxxx', level=1, xp=0, materias='[]', cpf=None, instituicao='None', photo='None', salt=''):
    conn = create_conn()
    try:
        create_table_students(conn)
        cursor = conn.cursor()

        
        hashedAndSalt = pass_hash.hash_password(password)
        #print(hashedAndSalt)
        hashed_password = hashedAndSalt[0]
        salt = hashedAndSalt[1]
        cursor.execute("""
            INSERT INTO alunos (nome, idade, email, senha, phone_number, level, xp, materias, cpf, instituicao, photo, salt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, age, email, hashed_password, phone_number, level, xp, materias, cpf, instituicao, photo, salt))
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
        create_table_institutions(conn)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM instituicoes")
        rows = cursor.fetchall()
        for row in rows:
            institutions.append({
                "id": row[0],
                "nome": row[1],
                "email": row[2],
                "senha": row[3],
                "phone_number": row[4],
                "photo": row[5],
                "descricao": row[6],
                "cursos": row[7],
                "alunos": row[8],
                "professores": row[9]
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
        create_table_institutions(conn)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO instituicoes (nome, email, senha, phone_number, photo, descricao, cursos, alunos, professores)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, email, password, phone_number, photo, descricao, cursos, alunos, professores))
        conn.commit()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()


