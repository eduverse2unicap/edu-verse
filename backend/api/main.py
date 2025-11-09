from fastapi import FastAPI, HTTPException, Query
import base64
from pydantic import BaseModel
from typing import Literal
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
    {
        "name": "Teachers",
        "description": "Operações relacionadas a professores, como login."
    }
    ,
    {
        "name": "Content",
        "description": "Operações para criar e gerenciar conteúdos educacionais."
    },
    {
        "name": "General",
        "description": "Endpoints de dados gerais, como matérias."
    }
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
    try:
        print("Inicializando aplicação e verificando tabelas do banco de dados...")
        banco.create_all_tables()
    except Exception as e:
        print(f"ERRO CRÍTICO: Não foi possível conectar ao banco de dados na inicialização: {e}")

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
    password: str
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

class Content(BaseModel):
    materia: str
    assunto: str
    descricao: str = None
    questoes: list = []
    arquivo: str = None # Para o base64 da imagem
    professor_id: int

class UpdateContent(BaseModel):
    materia: str
    assunto: str
    descricao: str = None
    questoes: list = []

class Teacher(BaseModel):
    name: str
    email: str = None
    senha: str
    phone_number: str = None
    photo: str = None
    disciplinas: str = '[]'
    instituicao: str = None
    tags: str = '[]'

class LoginCredentials(BaseModel):
    email: str
    password: str

@app.post("/new-student", tags=["Students"])
def create_student(student: Student):
    try:
        new_student = banco.add_student(
            name=student.name,
            age=student.idade,
            email=student.email,
            password=student.password,
            phone_number=student.phone_number,
            level=student.level,
            xp=student.xp,
            materias=student.materias,
            cpf=student.cpf,
            instituicao=student.instituicao,
            photo=student.photo,
            tags=student.tags
        )
        if "error" in new_student:
            raise HTTPException(status_code=400, detail=f"Erro ao criar estudante: {new_student['error']}")
        return new_student
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {e}")

@app.get("/check-existence", tags=["Students"])
def check_student_existence(field: Literal['email', 'cpf'], value: str):
    """
    Verifica se um email ou CPF já está cadastrado.
    - `field`: 'email' ou 'cpf'
    - `value`: O valor a ser verificado.
    """
    result = banco.check_existence(field=field, value=value)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return {"exists": result["exists"]}

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

@app.post("/login-student", tags=["Students"])
def login_student(credentials: LoginCredentials):
    result = banco.login_student(credentials.email, credentials.password)
    if "bem-sucedido" not in result.get("message", ""):
        raise HTTPException(status_code=401, detail=result.get("message", "Credenciais inválidas"))
    return result

@app.post("/login-teacher", tags=["Teachers"]) # Adicionando a tag para organização
def login_teacher(credentials: LoginCredentials):
    result = banco.login_teacher(credentials.email, credentials.password)
    if "bem-sucedido" not in result.get("message", ""):
        # Retorna 401 Unauthorized para falhas de login
        raise HTTPException(status_code=401, detail=result.get("message", "Credenciais inválidas"))
    # Retorna 200 OK com o ID do professor em caso de sucesso
    return result

@app.post("/new-content", tags=["Content"])
def create_content(content: Content):
    """
    Cria um novo conteúdo educacional. Requer o ID do professor.
    """
    try:
        new_content = banco.add_content(
            materia=content.materia,
            assunto=content.assunto,
            descricao=content.descricao,
            questoes=content.questoes,
            arquivo=content.arquivo,
            professor_id=content.professor_id
        )
        if "error" in new_content:
            raise HTTPException(status_code=400, detail=f"Erro ao criar conteúdo: {new_content['error']}")
        return new_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.get("/materias", tags=["General"])
def read_materias():
    return banco.get_materias()

@app.get("/contents/{materia_nome}", tags=["Content"])
def read_contents_by_materia(materia_nome: str):
    """
    Busca todos os conteúdos (assuntos) para uma matéria específica.
    """
    # A função do banco já retorna uma lista (vazia ou não),
    # então podemos retorná-la diretamente.
    return banco.get_contents_by_materia(materia_nome)

@app.get("/teacher-contents/{teacher_id}", tags=["Content"])
def read_contents_by_teacher(teacher_id: int):
    """
    Busca todos os conteúdos cadastrados por um professor específico.
    """
    contents = banco.get_contents_by_teacher(teacher_id)
    return contents

@app.delete("/delete-content/{content_id}", tags=["Content"], status_code=204)
def delete_content_by_id(content_id: int):
    """
    Deleta um conteúdo pelo seu ID.
    Retorna 204 No Content em caso de sucesso.
    """
    deleted_count = banco.delete_content(content_id)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")
    return None # Retorna uma resposta vazia com status 204

@app.get("/content/{content_id}", tags=["Content"])
def read_content_by_id(content_id: int):
    """Busca os detalhes de um conteúdo específico pelo seu ID."""
    content = banco.get_content_by_id(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")
    return content

@app.put("/update-content/{content_id}", tags=["Content"])
def update_content_by_id(content_id: int, content_data: UpdateContent):
    """Atualiza um conteúdo existente."""
    try:
        updated_content = banco.update_content(
            content_id=content_id,
            materia=content_data.materia,
            assunto=content_data.assunto,
            descricao=content_data.descricao,
            questoes=content_data.questoes
        )
        if "error" in updated_content:
            raise HTTPException(status_code=400, detail=updated_content['error'])
        return updated_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")