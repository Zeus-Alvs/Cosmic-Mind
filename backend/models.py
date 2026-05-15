from pydantic import BaseModel, EmailStr
from typing import Optional
from pydantic import BaseModel, EmailStr
from typing import Optional


class UsuarioCadastro(BaseModel):
    nome: str
    email: EmailStr  # Já verifica se o email tem o formato correto (@ e .com)
    senha: str
    tipo_perfil: str # Ex: "responsavel" ou "especialista"

# Este é o modelo para quando o usuário for fazer LOGIN
class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

# Este é o modelo que o back-end vai DEVOLVER (sempre escondendo a senha!)
class UsuarioRetorno(BaseModel):
    id: str
    nome: str
    email: EmailStr
    tipo_perfil: str
    email_pendente: Optional[str] = None

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
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
    foto_perfil: int = 1

