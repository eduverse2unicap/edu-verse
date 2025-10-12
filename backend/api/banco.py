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

def create_table(conn):
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alunos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                idade INTEGER NOT NULL,
                senha TEXT NOT NULL,
                level INTEGER NOT NULL DEFAULT 1,
                xp INTEGER NOT NULL DEFAULT 0,
                materias TEXT DEFAULT '[]'
            )
        """)
        conn.commit()
        print("Table created successfully")
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()


def get_students():
    create_table(create_conn())
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
                "level": row[4],
                "xp": row[5],
                "materias": row[6]
            })
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
    return students

def add_student(name, age, password, level=1, xp=0, materias='[]'):
    create_table(create_conn())
    conn = create_conn()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO alunos (nome, idade, senha, level, xp, materias)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, age, password, level, xp, materias))
        conn.commit()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
        