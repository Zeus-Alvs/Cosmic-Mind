from fastapi import FastAPI, Header
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class TestRequest(BaseModel):
    tipo: str
    valor: Optional[str] = None

@app.put("/api/teste")
def testar(update_data: TestRequest, authorization: str = Header(None)):
    print("=== FUNÇÃO TESTAR EXECUTOU ===")
    return {"message": "SUCESSO - funcao correta!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
