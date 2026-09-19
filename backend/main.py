from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.core.database import db
from app.estatisticas.router import router as estatisticas_router
from app.jogadores.router import router as jogadores_router
from app.partidas.router import router as partidas_router
from app.sessao.router import router as sessao_router
from app.usuarios.router import router as usuarios_router
from app.vinculos.router import router as vinculos_router

load_dotenv()

app = FastAPI(title="Cosmic Mind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://85.31.63.53:7485",
        "https://cosmic-mind-fatec.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "A API do Cosmic Mind está viva!"}


app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(partidas_router)
app.include_router(jogadores_router)
app.include_router(sessao_router)
app.include_router(vinculos_router)
app.include_router(estatisticas_router)


try:
    db["sessao"].create_index("expira_em", expireAfterSeconds=0)
except Exception:
    pass
