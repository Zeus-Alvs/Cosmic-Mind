from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCadastro(BaseModel):
    nome: str
    email: EmailStr  
    senha: str
    tipo_perfil: str 


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


class UsuarioRetorno(BaseModel):
    id: str
    nome: str
    email: EmailStr
    tipo_perfil: str
    email_pendente: Optional[str] = None
    avatar: Optional[int] = 1

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[int] = None
    tamanho_fonte: Optional[str] = None 

class TrocarSenha(BaseModel):
    senha_atual: str
    nova_senha: str

class EsqueciSenha(BaseModel):
    email: EmailStr

class RedefinirSenha(BaseModel):
    token: str
    nova_senha: str

class ConfirmarEmail(BaseModel):
    token: str

class JogadorCadastro(BaseModel):
    apelido: str
    data_nascimento: str
    foto_perfil: int = 1

class DefinirCRP(BaseModel):
    email: str
    crp: str

class ExcluirJogador(BaseModel):
    senha: str

class JogadorUpdate(BaseModel):
    apelido: Optional[str] = None
    foto_perfil: Optional[int] = None

class GameLoginRequest(BaseModel):
    code: str
