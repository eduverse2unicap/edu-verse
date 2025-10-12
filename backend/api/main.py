from fastapi import FastAPI
import banco

app = FastAPI()

@app.get("/")
def root():
    return {"status code": "200 ok"}

@app.get("/students")
def get_students():
    return banco.get_students()
