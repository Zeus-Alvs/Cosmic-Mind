from pydantic import BaseModel, EmailStr, root_validator
from typing import Optional, List
from datetime import datetime

class MetricasCognitivas(BaseModel):
    acertos: int
    erros: int
    tempo_medio_reacao_ms: int
    habilidade_foco: str

class PartidaModel(BaseModel):
    missionId: str
    pontuacao_final: int
    metricas_cognitivas: MetricasCognitivas
    iniciado_em: datetime
    finalizado_em: datetime
class UsuarioCadastro(BaseModel):
    nome: str
    email: EmailStr  
    senha: str
    tipo_perfil: str 
    crm: Optional[str] = None
    clinica: Optional[str] = None
    ocupacao: Optional[str] = None
    
    @root_validator(skip_on_failure=True)
    def validar_especialista(cls, values):
        if values.get('tipo_perfil') == 'especialista':
            if not values.get('crm'):
                raise ValueError('O campo CRM é obrigatório')
        return values

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
    token_acesso: Optional[str] = None
    crm: Optional[str] = None
    clinica: Optional[str] = None
    ocupacao: Optional[str] = None

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[int] = None
    tamanho_fonte: Optional[str] = None
    crm: Optional[str] = None
    clinica: Optional[str] = None
    ocupacao: Optional[str] = None

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

class DesbloquearPlaneta(BaseModel):
    planeta: str 

class AtualizarPontuacao(BaseModel):
    fase_id: str
    pontuacao: int
    estrelas: int 

class AtualizarPreferencias(BaseModel):
    volume_musica: Optional[int] = None
    daltonismo_modo: Optional[bool] = None

class DesbloquearItem(BaseModel):
    item_type: str  
    item_id: str

class AtualizarProgressoRequest(BaseModel):
    tipo: str  
    valor: Optional[str] = None
    missionId: Optional[str] = None
    score: Optional[int] = None
    starsEarned: Optional[int] = None
    volumeMusica: Optional[int] = None
    daltonismoModo: Optional[bool] = None
    item_id: Optional[str] = None

class DeletarContaRequest(BaseModel):
    senha: str

class SolicitarVinculo(BaseModel):
    codigo_vinculo: str

class ResponderVinculo(BaseModel):
    id_solicitacao: str
    acao: str
