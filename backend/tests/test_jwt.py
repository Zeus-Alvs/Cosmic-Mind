"""
Teste de criação de token JWT e login no Cosmic Mind
Executar com: python -m uvicorn tests.test_jwt:app --host 127.0.0.1 --port 8001
"""
import sys
sys.path.insert(0, ".")

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import jwt
import secrets
import random

app = FastAPI()

# Mesmas configs do main.py
JWT_SECRET = secrets.token_hex(32)
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 2

ID_JOGADOR_TESTE = "6749a1b2c3d4e5f678901234"

class GameLoginRequest(BaseModel):
    code: str


def gerar_jwt(id_jogador: str) -> str:
    payload = {
        "id_jogador": id_jogador,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@app.get("/teste-jwt")
def teste_jwt_completo():
    """
    Testa o fluxo completo: gerar PIN -> game login -> JWT
    """
    # Simula gerar PIN (não acessa banco, só gera o que a rota retornaria)
    pin_gerado = str(random.randint(0, 999999)).zfill(6)
    tempo_expiracao = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Gera JWT real
    token_jwt = gerar_jwt(ID_JOGADOR_TESTE)

    resultado = {
        "pin_criado": pin_gerado,
        "token_acesso": token_jwt,
        "expira_em": tempo_expiracao.isoformat(),
        "id_jogador": ID_JOGADOR_TESTE
    }

    return resultado


@app.post("/teste-login")
def teste_game_login(dados: GameLoginRequest):
    """
    Simula o game-login validando o PIN e retornando o JWT
    """
    pin_valido = dados.code

    if len(pin_valido) != 6 or not pin_valido.isdigit():
        raise HTTPException(status_code=401, detail="Código inválido.")

    # Gera JWT real
    token_jwt = gerar_jwt(ID_JOGADOR_TESTE)

    return {
        "accessToken": token_jwt,
        "login": f"Login - SUCESSO - JWT - #{token_jwt}"
    }


if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("Teste JWT - Cosmic Mind")
    print("=" * 60)
    print("\nRotas disponíveis:")
    print("  GET  /teste-jwt     - Criar PIN e JWT (mostra ambos)")
    print("  POST /teste-login   - Simular login com PIN")
    print("\nExemplo de uso:")
    print('  curl http://localhost:8001/teste-jwt')
    print('  curl -X POST http://localhost:8001/teste-login -H "Content-Type: application/json" -d \'{"code": "123456"}\'')
    print("=" * 60)
    uvicorn.run(app, host="127.0.0.1", port=8001)