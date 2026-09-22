from fastapi import APIRouter
from models import UsuarioLogin, UsuarioRetorno, UsuarioCadastro
from app.auth.service import login, register

router = APIRouter(tags=["auth"])

@router.post("/api/cadastrar", response_model=UsuarioRetorno, status_code=201)
@router.post("/cadastrar", response_model=UsuarioRetorno, status_code=201, include_in_schema=False)
def register_usuario(dados: UsuarioCadastro):
    return register(dados)

@router.post("/api/login", response_model=UsuarioRetorno, status_code=200)
@router.post("/login", response_model=UsuarioRetorno, status_code=200, include_in_schema=False)
def login_usuario(dados: UsuarioLogin):
    return login(dados.email, dados.senha)