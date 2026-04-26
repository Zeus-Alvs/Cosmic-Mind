from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId # Serve para o MongoDB entender os IDs únicos
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from models import UsuarioCadastro, UsuarioLogin, UsuarioRetorno

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI(title="Cosmic Mind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Conectando ao Banco
MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client["cosmic_mind_db"]
colecao_usuarios = db["usuarios"]

@app.get("/")
def read_root():
    return {"status": "A API do Cosmic Mind está viva!"}

# --- ROTA DE CADASTRO ---
@app.post("/api/cadastrar", response_model=UsuarioRetorno, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(novo_usuario: UsuarioCadastro):
    # 1. Verifica se o e-mail já existe no banco
    usuario_existente = colecao_usuarios.find_one({"email": novo_usuario.email})
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")

    # 2. Transforma o molde em um dicionário que o MongoDB entende
    usuario_dict = novo_usuario.dict()
    usuario_dict["senha"] = pwd_context.hash(novo_usuario.senha)
    resultado = colecao_usuarios.insert_one(usuario_dict)
    
    # 4. Monta a resposta para devolver ao Front-end (escondendo a senha!)
    return UsuarioRetorno(
        id=str(resultado.inserted_id),
        nome=usuario_dict["nome"],
        email=usuario_dict["email"],
        tipo_perfil=usuario_dict["tipo_perfil"]
    )

# --- ROTA DE LOGIN ---
@app.post("/api/login", response_model=UsuarioRetorno, status_code=status.HTTP_200_OK)
def login_usuario(credenciais: UsuarioLogin):
    # 1. Busca o usuário no banco usando o e-mail
    usuario_banco = colecao_usuarios.find_one({"email": credenciais.email})
    
    # 2. Se não achar o e-mail ou se a senha estiver errada, bloqueia o acesso
    if not usuario_banco or not pwd_context.verify(credenciais.senha, usuario_banco["senha"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    
    # 3. Se deu tudo certo, devolve os dados de volta para o Front-end liberar a tela
    return UsuarioRetorno(
        id=str(usuario_banco["_id"]),
        nome=usuario_banco["nome"],
        email=usuario_banco["email"],
        tipo_perfil=usuario_banco["tipo_perfil"]
    )