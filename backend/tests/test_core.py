from app.core.security import (
    create_user_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash():
    password = "senha-segura"
    password_hash = hash_password(password)

    assert password_hash != password
    assert verify_password(password, password_hash)


def test_user_token():
    token = create_user_token("123")

    payload = decode_token(token)

    assert payload["sub"] == "123"
    assert payload["type"] == "user"