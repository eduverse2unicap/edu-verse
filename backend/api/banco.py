import sqlite3
from sqlite3 import Error
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'db.db')

def create_conn():
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        print("Connection successful")
    except Error as e:
        print(f"Error: {e}")
    return conn
#tables creation!
#students
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
                photo TEXT DEFAULT 'None'
            )
        """)
        conn.commit()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
#instituitions
def create_table_institutions(conn):
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS instituicoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE,
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
    create_table_students(create_conn())
    conn = create_conn()
    students = []
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alunos")
        rows = cursor.fetchall()
        for row in rows:
            students.append({
                "id": row[0],
                "nome": row[1],
                "idade": row[2],
                "email": row[3],
                "senha": row[4],
                "phone_number": row[5],
                "level": row[6],
                "xp": row[7],
                "materias": row[8],
                "cpf": row[9],
                "instituicao": row[10],
                "photo": row[9]
            })
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
    return students

def add_student(name, age, email, password, level=1, xp=0, materias='[]', cpf=None, instituicao=None, photo=None):
    create_table_students(create_conn())
    conn = create_conn()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO alunos (nome, idade, email, senha, level, xp, materias, cpf, instituicao, photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, age, email, password, level, xp, materias, cpf, instituicao, photo))
        conn.commit()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

def get_institutions():
    create_table_institutions(create_conn())
    conn = create_conn()
    institutions = []
    try:
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

def add_institution(name, email, password, phone_number=None, photo=None, descricao=None, cursos='[]', alunos='[]', professores='[]'):
    create_table_institutions(create_conn())
    conn = create_conn()
    try:
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