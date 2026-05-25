import importlib
import sys
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

class FakeUsuariosCollection:
    def __init__(self):
        self.inserted_doc = None
        self.user_to_find = None
        self.last_find_query = None
        self.last_update_query = None
        self.last_update_payload = None

    def find_one(self, query):
        self.last_find_query = query
        return self.user_to_find

    def insert_one(self, document):
        self.inserted_doc = document.copy()
        return SimpleNamespace(inserted_id="usuario-teste")

    def update_one(self, query, payload):
        self.last_update_query = query
        self.last_update_payload = payload
        return SimpleNamespace(modified_count=1)


class FakeDatabase:
    def __getitem__(self, name):
        return FakeUsuariosCollection()


class FakeMongoClient:
    def __getitem__(self, name):
        return FakeDatabase()


with patch("pymongo.MongoClient", return_value=FakeMongoClient()):
    main = importlib.import_module("main")


class CadastroEspecialistaTestCase(unittest.TestCase):
    def test_cadastro_especialista_mapeia_crm_para_crp_especialista(self):
        fake_collection = FakeUsuariosCollection()
        novo_usuario = main.UsuarioCadastro(
            nome="Dra. Ana",
            email="ana@example.com",
            senha="Senha@123",
            tipo_perfil="especialista",
            crm="CRP-12345",
            clinica="Clinica Horizonte",
            ocupacao="Psicologa",
        )

        with patch.object(main, "colecao_usuarios", fake_collection):
            response = main.cadastrar_usuario(novo_usuario)

        self.assertEqual(response.id, "usuario-teste")
        self.assertEqual(response.tipo_perfil, "especialista")
        self.assertEqual(response.crm, "CRP-12345")
        self.assertEqual(response.clinica, "Clinica Horizonte")
        self.assertEqual(response.ocupacao, "Psicologa")

        self.assertIsNotNone(fake_collection.inserted_doc)
        self.assertEqual(fake_collection.inserted_doc["crp_especialista"], "CRP-12345")
        self.assertNotIn("crm_especialista", fake_collection.inserted_doc)
        self.assertNotIn("crm", fake_collection.inserted_doc)

    def test_definir_crp_atualiza_campo_crp_especialista(self):
        fake_collection = FakeUsuariosCollection()
        fake_collection.user_to_find = {
            "_id": "usuario-teste",
            "email": "ana@example.com",
            "tipo_perfil": "especialista",
        }
        dados = main.DefinirCRP(email="ana@example.com", crp="CRP-99999")

        with patch.object(main, "colecao_usuarios", fake_collection):
            response = main.definir_crp(dados)

        self.assertEqual(response["message"], "CRP atualizado com sucesso")
        self.assertEqual(fake_collection.last_find_query, {"email": "ana@example.com"})
        self.assertEqual(fake_collection.last_update_query, {"email": "ana@example.com"})
        self.assertEqual(
            fake_collection.last_update_payload,
            {"$set": {"crp_especialista": "CRP-99999"}},
        )


if __name__ == "__main__":
    unittest.main()
