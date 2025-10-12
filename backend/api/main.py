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
    senha: str
    level: int = 1
    xp: int = 0
    materias: str = '[]'

@app.post("/new-student")
def create_student(student: Student):
    banco.add_student(
        name = student.name,
        age = student.idade,
        password = student.senha,
        level = student.level,
        xp = student.xp,
        materias = student.materias
    )