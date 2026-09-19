import unittest
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.auth import service as auth_service
from app.core.dependencies import get_current_user
from models import DefinirCRP, UsuarioCadastro


class CadastroEspecialistaTestCase(unittest.TestCase):
    def test_cadastro_especialista_mapeia_crm_para_crp_especialista(self):
        novo_usuario = UsuarioCadastro(
            nome="Dra. Ana",
            email="ana@example.com",
            senha="Senha@123",
            tipo_perfil="especialista",
            crm="CRP-12345",
            clinica="Clinica Horizonte",
            ocupacao="Psicologa",
        )

        with patch.object(auth_service.repository, "find_user_by_email", return_value=None), \
             patch.object(auth_service, "hash_password", return_value="hash_fake"), \
             patch.object(auth_service.repository, "create_user", return_value=SimpleNamespace(inserted_id="usuario-teste")) as create_user_mock:
            response = auth_service.register(novo_usuario)

        self.assertEqual(response.id, "usuario-teste")
        self.assertEqual(response.tipo_perfil, "especialista")
        self.assertEqual(response.crm, "CRP-12345")
        self.assertEqual(response.clinica, "Clinica Horizonte")
        self.assertEqual(response.ocupacao, "Psicologa")

        payload = create_user_mock.call_args.args[0]
        self.assertEqual(payload["crp_especialista"], "CRP-12345")
        self.assertEqual(payload["senha"], "hash_fake")
        self.assertNotIn("crm", payload)

    def test_definir_crp_atualiza_campo_crp_especialista(self):
        dados = DefinirCRP(email="ana@example.com", crp="CRP-99999")
        usuario = {
            "_id": "usuario-teste",
            "email": "ana@example.com",
            "tipo_perfil": "especialista",
        }

        with patch.object(auth_service.repository, "find_user_by_email", return_value=usuario), \
             patch.object(auth_service.usuarios, "update_one") as update_one_mock:
            response = auth_service.definir_crp(dados)

        self.assertEqual(response["message"], "CRP atualizado com sucesso")
        update_one_mock.assert_called_once_with(
            {"email": "ana@example.com"},
            {"$set": {"crp_especialista": "CRP-99999"}},
        )

    def test_get_current_user_rejeita_token_jwt_invalido(self):
        with patch("app.core.dependencies.sessoes.find_one", return_value={"token_acesso": "token-falso", "id_usuario": "user-1"}), \
             patch("app.core.dependencies.usuarios.find_one", return_value={"_id": "user-1", "email": "ana@example.com"}):
            with pytest.raises(Exception):
                get_current_user(authorization="Bearer token-falso")


if __name__ == "__main__":
    unittest.main()
