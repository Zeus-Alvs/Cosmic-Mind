from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import Header, HTTPException

from app.core.database import db
from app.partidas.repository import find_jogador_by_id, find_session_by_token, update_jogador
from match_performance_calculator.MatchPerformanceCalculator import MatchPerformanceCalculator
from models import (
    AtualizarProgressoRequest,
    MelhorPartidaModel,
    PartidaParaPersistirComPontuacaoModel,
    PartidaParaPersistirModel,
)

calculator = MatchPerformanceCalculator()


def _require_session_from_token(authorization: str | None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de acesso ausente.")

    token = authorization.replace("Bearer ", "")
    sessao = find_session_by_token(token)

    if not sessao:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

    return sessao


def salvar_partida(partida: PartidaParaPersistirModel, authorization: str = Header(None)):
    sessao = _require_session_from_token(authorization)
    id_jogador = ObjectId(sessao["id_jogador"])

    pontuacao, estrelas, metricas_cognitivas = calculator.calcular_pontuacao(partida)

    partida_para_salvar = PartidaParaPersistirComPontuacaoModel(
        missionId=partida.missionId,
        planetId=partida.planetId,
        iniciado_em=partida.start_time,
        finalizado_em=partida.end_time,
        pontuacao_final=pontuacao,
        metricas_cognitivas=metricas_cognitivas,
    )

    partida_dict = partida_para_salvar.model_dump()
    partida_dict["id_jogador"] = id_jogador
    db["partidas"].insert_one(partida_dict)

    jogador = find_jogador_by_id(id_jogador)
    melhores_pontuacoes = jogador.get("melhores_pontuacoes", [])

    registro_atual = next(
        (p for p in melhores_pontuacoes if p.get("missionId") == partida.missionId),
        None,
    )

    novo_registro = {
        "missionId": partida.missionId,
        "planetId": partida.planetId,
        "score": pontuacao,
        "starsEarned": estrelas,
    }

    registro_retornado = novo_registro

    if not registro_atual:
        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"melhores_pontuacoes": novo_registro}},
        )
    elif pontuacao > registro_atual.get("score", 0):
        db["jogador"].update_one(
            {"_id": id_jogador, "melhores_pontuacoes.missionId": partida.missionId},
            {"$set": {
                "melhores_pontuacoes.$.score": pontuacao,
                "melhores_pontuacoes.$.starsEarned": estrelas,
            }},
        )
    else:
        registro_retornado = registro_atual

    return MelhorPartidaModel(**registro_retornado)


def planetas_desbloqueados(authorization: str = Header(None)):
    sessao = _require_session_from_token(authorization)
    jogador = find_jogador_by_id(ObjectId(sessao["id_jogador"]))
    if not jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")
    return jogador.get("planetas_desbloqueados", [])


def melhores_pontuacoes(planetId: str, authorization: str = Header(None)):
    sessao = _require_session_from_token(authorization)
    jogador = find_jogador_by_id(ObjectId(sessao["id_jogador"]))
    if not jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")
    return [
        item for item in jogador.get("melhores_pontuacoes", [])
        if item.get("planetId") == planetId
    ]


def atualizar_progresso(update_data: AtualizarProgressoRequest, authorization: str = Header(None)):
    sessao = _require_session_from_token(authorization)
    id_jogador = ObjectId(sessao["id_jogador"])

    if update_data.tipo == "planeta":
        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"planetas_desbloqueados": update_data.valor}},
        )

    elif update_data.tipo == "pontuacao":
        existente = db["jogador"].find_one({
            "_id": id_jogador,
            "melhores_pontuacoes.missionId": update_data.missionId,
        })

        if existente:
            db["jogador"].update_one(
                {"_id": id_jogador, "melhores_pontuacoes.missionId": update_data.missionId},
                {"$set": {
                    "melhores_pontuacoes.$.score": update_data.score,
                    "melhores_pontuacoes.$.starsEarned": update_data.starsEarned,
                }},
            )
        else:
            db["jogador"].update_one(
                {"_id": id_jogador},
                {"$push": {"melhores_pontuacoes": {
                    "missionId": update_data.missionId,
                    "score": update_data.score,
                    "starsEarned": update_data.starsEarned,
                }}},
            )

    elif update_data.tipo == "pet":
        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"pets_desbloqueados": ObjectId(update_data.item_id)}},
        )

    elif update_data.tipo == "conquista":
        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"conquistas_obtidas": ObjectId(update_data.item_id)}},
        )

    elif update_data.tipo == "preferencias":
        prefs = {}
        if update_data.volumeMusica is not None:
            prefs["preferencias_jogo.volume_musica"] = update_data.volumeMusica
        if update_data.daltonismoModo is not None:
            prefs["preferencias_jogo.daltonismo_modo"] = update_data.daltonismoModo
        if prefs:
            db["jogador"].update_one({"_id": id_jogador}, {"$set": prefs})

    return {"message": "Progresso atualizado com sucesso!"}


def listar_todos_jogadores(_current_user):
    jogadores = list(db["jogador"].find())
    return [{"id": str(j["_id"]), "nome": j.get("apelido", "Jogador")} for j in jogadores]
