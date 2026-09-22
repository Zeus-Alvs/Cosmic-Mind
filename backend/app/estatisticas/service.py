from bson import ObjectId
from fastapi import HTTPException

from app.core.database import db


def obter_estatisticas(id_jogador: str, planetId: str | None = None, current_user: dict | None = None):
    if not id_jogador or str(id_jogador).strip().lower() in {"undefined", "null", "none", ""}:
        raise HTTPException(status_code=400, detail="ID de jogador inválido.")

    try:
        jogador_obj_id = ObjectId(id_jogador)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de jogador inválido.")

    if current_user and current_user.get("tipo_perfil") == "responsavel":
        vinculos = current_user.get("jogadores_vinculados", [])
        if jogador_obj_id not in vinculos and id_jogador not in [str(v) for v in vinculos]:
            raise HTTPException(status_code=403, detail="Você não tem permissão para visualizar estatísticas deste jogador.")

    jogador = db["jogador"].find_one({"_id": jogador_obj_id})
    if not jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    filtro_partida = {"id_jogador": jogador_obj_id}
    if planetId:
        filtro_partida["planetId"] = planetId

    partidas = list(db["partidas"].find(filtro_partida))

    if not partidas:
        return {
            "id_jogador": id_jogador,
            "nome_jogador": jogador.get("apelido", "Jogador"),
            "foto_perfil": jogador.get("foto_perfil", 1),
            "planetas_liberados": jogador.get("planetas_desbloqueados", []),
            "total_partidas": 0,
            "total_acertos": 0,
            "total_erros": 0,
            "media_tempo_reacao_ms": 0,
            "pontuacao_maxima": 0,
            "evolucao_por_missao": [],
            "habilidades": {
                "Agilidade": 0,
                "Lógica": 0,
                "Memorização": 0,
                "Leitura": 0,
                "Interpretação": 0,
                "Concentração": 0,
            },
        }

    total_acertos = sum(p["metricas_cognitivas"]["acertos"] for p in partidas)
    total_erros = sum(p["metricas_cognitivas"]["erros"] for p in partidas)

    tempos = [p["metricas_cognitivas"]["tempo_medio_reacao_ms"] for p in partidas]
    media_tempo = round(sum(tempos) / len(tempos)) if tempos else 0
    pontuacao_maxima = max((p["pontuacao_final"] for p in partidas), default=0)

    evolucao = []
    for p in partidas:
        evolucao.append({
            "missionId": p.get("missionId", ""),
            "pontuacao": p.get("pontuacao_final", 0),
            "acertos": p["metricas_cognitivas"]["acertos"],
            "erros": p["metricas_cognitivas"]["erros"],
            "tempo_reacao_ms": p["metricas_cognitivas"]["tempo_medio_reacao_ms"],
            "data": p.get("finalizado_em", "").isoformat() if hasattr(p.get("finalizado_em", ""), "isoformat") else str(p.get("finalizado_em", "")),
        })

    mapa_habilidades: dict = {}
    for p in partidas:
        habilidade = p["metricas_cognitivas"].get("habilidade_foco", "")
        acertos = p["metricas_cognitivas"]["acertos"]
        erros = p["metricas_cognitivas"]["erros"]
        total = acertos + erros
        if not habilidade or total == 0:
            continue
        taxa = round((acertos / total) * 100)
        mapa_habilidades.setdefault(habilidade, []).append(taxa)

    habilidades_medias = {h: round(sum(v) / len(v)) for h, v in mapa_habilidades.items()}
    habilidades_padrao = ["Agilidade", "Lógica", "Memorização", "Leitura", "Interpretação", "Concentração"]
    habilidades_final = {h: habilidades_medias.get(h, 0) for h in habilidades_padrao}

    return {
        "id_jogador": id_jogador,
        "nome_jogador": jogador.get("apelido", "Jogador"),
        "foto_perfil": jogador.get("foto_perfil", 1),
        "planetas_liberados": jogador.get("planetas_desbloqueados", []),
        "total_partidas": len(partidas),
        "total_acertos": total_acertos,
        "total_erros": total_erros,
        "media_tempo_reacao_ms": media_tempo,
        "pontuacao_maxima": pontuacao_maxima,
        "evolucao_por_missao": evolucao,
        "habilidades": habilidades_final,
    }
