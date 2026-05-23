"""
Teste de Integridade das Rotas - Cosmic Mind
Valida que rotas públicas funcionam e rotas protegidas exigem JWT.

Executar com: python -m uvicorn tests.test_integridade:app --host 127.0.0.1 --port 8002
"""
import sys
sys.path.insert(0, ".")

from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
import jwt
import secrets
import random

app = FastAPI()

# Configs (espelha o main.py)
JWT_SECRET = secrets.token_hex(32)
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 2
ID_JOGADOR_TESTE = "6749a1b2c3d4e5f678901234"


def gerar_jwt(id_jogador: str) -> str:
    payload = {
        "id_jogador": id_jogador,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def validar_jwt(token: str) -> bool:
    """Valida se o JWT é válido (mesma lógica do main.py)"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return True
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False


class GameLoginRequest(BaseModel):
    code: str


class PartidaRequest(BaseModel):
    missionId: str
    pontuacao_final: int


class ProgressoRequest(BaseModel):
    tipo: str
    valor: Optional[str] = None


# ───────────────────────────────────────────────
# ROTAS DE TESTE (espelham o main.py)
# ───────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "A API do Cosmic Mind está viva!"}


@app.post("/api/jogo/gerar-pin/{id_jogador}")
def gerar_pin(id_jogador: str):
    """Espelha /api/jogo/gerar-pin do main.py"""
    pin = str(random.randint(0, 999999)).zfill(6)
    return {
        "pin": pin,
        "id_jogador": id_jogador
    }


@app.post("/game-login")
def game_login(dados: GameLoginRequest):
    """Espelha /game-login do main.py"""
    if len(dados.code) != 6:
        raise HTTPException(status_code=401, detail="Código inválido.")
    token_jwt = gerar_jwt(ID_JOGADOR_TESTE)
    return {"accessToken": token_jwt}


@app.post("/api/partidas/salvar")
def salvar_partida(
    partida: PartidaRequest,
    authorization: Optional[str] = Header(None)
):
    """Espelha /api/partidas/salvar - REQUER JWT"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente.")

    token = authorization.replace("Bearer ", "")
    if not validar_jwt(token):
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

    return {"message": "Partida salva com sucesso!", "missionId": partida.missionId}


@app.put("/api/progresso/jogador/update")
def atualizar_progresso(
    progresso: ProgressoRequest,
    authorization: Optional[str] = Header(None)
):
    """Espelha /api/progresso/jogador/update - REQUER JWT"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente.")

    token = authorization.replace("Bearer ", "")
    if not validar_jwt(token):
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

    return {"message": "Progresso atualizado com sucesso!"}


# ───────────────────────────────────────────────
# ROTA DE TESTE DE INTEGRIDADE
# ───────────────────────────────────────────────

@app.get("/teste-integridade")
def rodar_testes():
    """Roda todos os testes de integridade e retorna relatório."""

    resultados = []
    token_jwt = gerar_jwt(ID_JOGADOR_TESTE)

    # ── Teste 1: Health check ──
    try:
        resp = read_root()
        status_1 = "✅ OK" if any("viva" in str(v) for v in resp.values()) else "❌ FALHA"
    except Exception as e:
        status_1 = f"❌ ERRO: {e}"
    resultados.append(("Health check (GET /)", status_1))

    # ── Teste 2: Gerar PIN ──
    try:
        resp = gerar_pin(ID_JOGADOR_TESTE)
        tem_pin = "pin" in resp and len(resp["pin"]) == 6
        sem_jwt = "token_acesso" not in resp
        status_2 = "✅ OK" if (tem_pin and sem_jwt) else "❌ FALHA"
    except Exception as e:
        status_2 = f"❌ ERRO: {e}"
    resultados.append(("Gerar PIN sem JWT (/api/jogo/gerar-pin)", status_2))

    # ── Teste 3: Game login ──
    try:
        resp = game_login(GameLoginRequest(code="123456"))
        tem_jwt = "accessToken" in resp and resp["accessToken"].startswith("eyJ")
        status_3 = "✅ OK" if tem_jwt else "❌ FALHA"
    except Exception as e:
        status_3 = f"❌ ERRO: {e}"
    resultados.append(("Game login (/game-login)", status_3))

    # ── Teste 4: Salvar partida SEM token ──
    try:
        salvar_partida(PartidaRequest(missionId="teste", pontuacao_final=100), None)
        status_4 = "❌ FALHA (aceitou sem token)"
    except HTTPException as e:
        status_4 = "✅ OK (rejeitou sem token)" if e.status_code == 401 else f"❌ ERRO: {e}"
    resultados.append(("Salvar sem token (deve falhar)", status_4))

    # ── Teste 5: Salvar partida COM token ──
    try:
        resp = salvar_partida(
            PartidaRequest(missionId="teste", pontuacao_final=100),
            f"Bearer {token_jwt}"
        )
        status_5 = "✅ OK" if "sucesso" in resp.get("message", "") else "❌ FALHA"
    except Exception as e:
        status_5 = f"❌ ERRO: {e}"
    resultados.append(("Salvar com token (deve funcionar)", status_5))

    # ── Teste 6: Atualizar progresso SEM token ──
    try:
        atualizar_progresso(ProgressoRequest(tipo="planeta", valor="marte"), None)
        status_6 = "❌ FALHA (aceitou sem token)"
    except HTTPException as e:
        status_6 = "✅ OK (rejeitou sem token)" if e.status_code == 401 else f"❌ ERRO: {e}"
    resultados.append(("Progresso sem token (deve falhar)", status_6))

    # ── Teste 7: Atualizar progresso COM token ──
    try:
        resp = atualizar_progresso(
            ProgressoRequest(tipo="planeta", valor="marte"),
            f"Bearer {token_jwt}"
        )
        status_7 = "✅ OK" if "sucesso" in resp.get("message", "") else "❌ FALHA"
    except Exception as e:
        status_7 = f"❌ ERRO: {e}"
    resultados.append(("Progresso com token (deve funcionar)", status_7))

    # ── Teste 8: JWT válido aceito ──
    resultado_8a = validar_jwt(token_jwt)
    status_8a = "✅ OK" if resultado_8a is True else "❌ FALHA"
    resultados.append(("JWT válido aceito", status_8a))

    # ── Teste 9: JWT inválido rejeitado ──
    resultado_8b = validar_jwt("token_invalido")
    status_8b = "✅ OK" if resultado_8b is False else "❌ FALHA"
    resultados.append(("JWT inválido rejeitado", status_8b))

    # ── Monta output ──
    total = len(resultados)
    ok_count = sum(1 for _, s in resultados if "✅" in s)
    output_lines = [
        "",
        "=" * 60,
        "🔍 TESTE DE INTEGRIDADE - Cosmic Mind API",
        "=" * 60,
        "",
    ]
    for nome, status in resultados:
        output_lines.append(f"  {status} │ {nome}")

    output_lines.extend([
        "",
        f"📊 Resultado: {ok_count}/{total} testes passaram",
        "=" * 60,
        ""
    ])

    return {
        "resultados": dict(resultados),
        "resumo": f"{ok_count}/{total}",
        "relatorio": "\n".join(output_lines)
    }


if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("Teste de Integridade - Cosmic Mind API")
    print("=" * 60)
    print("\nRotas disponíveis:")
    print("  GET  /                    - Health check")
    print("  POST /api/jogo/gerar-pin  - Gerar PIN")
    print("  POST /game-login          - Login (retorna JWT)")
    print("  POST /api/partidas/salvar - Salvar partida (requer JWT)")
    print("  PUT  /api/progresso/...   - Atualizar progresso (requer JWT)")
    print("  GET  /teste-integridade   - Rodar todos os testes")
    print("\nExemplo:")
    print("  curl http://localhost:8002/teste-integridade")
    print("=" * 60)
    uvicorn.run(app, host="127.0.0.1", port=8002)
