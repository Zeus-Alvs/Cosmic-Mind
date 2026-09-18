from fastapi import APIRouter
from models import UsuarioLogin, UsuarioRetorno, UsuarioCadastro
from app.auth.service import login, register

router = APIRouter(tags=["auth"])

@router.post("/cadastrar", response_model=UsuarioRetorno, status_code=201)

def register_usuario(dados: UsuarioCadastro):
    return register(dados)

@router.post("/login", response_model=UsuarioRetorno, status_code=200)

def login_usuario(dados: UsuarioLogin):
    return login(dados.email, dados.senha)