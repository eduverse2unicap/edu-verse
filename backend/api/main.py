from fastapi import FastAPI
from pydantic import BaseModel
import banco

app = FastAPI()

@app.get("/")
def root():
    return {"status code": "200 ok"}

@app.get("/students")
def get_students():
    return banco.get_students()

class Student(BaseModel):
    name: str
    idade: int
    email: str = None
    senha: str
    phone_number: str = None
    level: int = 1
    xp: int = 0
    materias: str = '[]'
    cpf: str
    instituicao: str = None
    photo: str = None

class Institution(BaseModel):
    name: str
    address: str = None
    email: str = None
    senha: str = None
    phone_number: str = None
    photo: str = None
    description: str = None
    cursos: str = '[]'
    alunos: str = '[]'
    professores: str = '[]'

@app.post("/new-student")
def create_student(student: Student):
    banco.add_student(
        name = student.name,
        age = student.idade,
        email = student.email,
        password = student.senha,
        phone_number = student.phone_number,
        level = student.level,
        xp = student.xp,
        materias = student.materias,
        cpf = student.cpf,
        instituicao = student.instituicao,
        photo = student.photo
    )

@app.get("/institutions")
def get_institutions():
    return banco.get_institutions()

@app.post("/new-institution")
def create_institution(institution: Institution):
    banco.add_institution(
        name = institution.name,
        email = institution.email,
        password = institution.senha,
        phone_number = institution.phone_number,
        photo = institution.photo,
        descricao = institution.description,
        cursos = institution.cursos,
        alunos = institution.alunos,
        professores = institution.professores
    )