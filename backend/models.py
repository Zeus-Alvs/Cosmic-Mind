from pydantic import BaseModel, EmailStr
from typing import Optional

# Este é o modelo para quando o usuário for se CADASTRAR
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