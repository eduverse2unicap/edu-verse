from fastapi import FastAPI
import base64
from pydantic import BaseModel
from . import banco

tags_metadata = [
    {
        "name": "Students",
        "description": "Operações com estudantes. Crie, leia e delete estudantes.",
    },
    {
        "name": "Institutions",
        "description": "Gerencie as instituições de ensino.",
    },
    {
        "name": "Questions",
        "description": "Endpoints para gerenciar as perguntas da plataforma.",
    },
]

app = FastAPI(
    title="Edu-Verse API",
    version="1.1.6",
    description="API para a plataforma de aprendizado Edu-Verse. Use os endpoints abaixo para interagir com os dados.",
    openapi_tags=tags_metadata
)

# Garante que todas as tabelas e suas colunas existam na inicialização da aplicação
@app.on_event("startup")
async def startup_event():
    banco.create_all_tables()

@app.get("/", tags=["Root"])
def root():
    return {"status code": "200 ok"}

@app.get("/students", tags=["Students"])
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
    tags: str = '[]'

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

class Question(BaseModel):
    enunciado: str
    opcoes: str
    resposta_certa: str
    nivel_dificuldade: int
    materia: str
    tags: str = '[]'

class Teacher(BaseModel):
    name: str
    email: str = None
    senha: str
    phone_number: str = None
    photo: str = None
    disciplinas: str = '[]'
    instituicao: str = None
    tags: str = '[]'

@app.post("/new-student", tags=["Students"])
def create_student(student: Student):
    new_student = banco.add_student(
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
        photo = student.photo,
        tags = student.tags
    )
    return new_student

@app.delete("/delete-student/{student_id}&{name}", tags=["Students"])
def delete_student(student_id: int, name: str):
    banco.delete_student(student_id, name)

@app.get("/institutions", tags=["Institutions"])
def get_institutions():
    return banco.get_institutions()

@app.post("/new-institution", tags=["Institutions"])
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

@app.delete("/delete-institution/{institution_id}&{name}", tags=["Institutions"])
def delete_institution(institution_id: int, name: str):
    banco.delete_institution(institution_id, name)


@app.get('/questions', tags=["Questions"])
def get_questions():
    return banco.get_questions()

@app.post('/new-question', tags=["Questions"])
def create_question(question: Question):
    banco.add_question(
        enunciado=question.enunciado,
        opcoes=question.opcoes,
        resposta_certa=question.resposta_certa,
        nivel_dificuldade=question.nivel_dificuldade,
        materia=question.materia,
        tags=question.tags
    )

@app.delete('/delete-question/{question_id}&{enunciado}', tags=["Questions"])
def delete_question(question_id: int, enunciado: str, tags: str = '[]'):
    banco.delete_question(question_id, enunciado, tags)