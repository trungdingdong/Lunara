import pytest
from app.main import run_migrations
from fastapi import FastAPI
from fastapi.testclient import TestClient

REGISTER = {"email": "Seeker@Example.com", "password": "s3cret-passphrase"}


@pytest.fixture
def auth_app(app: FastAPI) -> FastAPI:
    settings = app.state.settings
    run_migrations(settings.database_url)
    return app


def _register(client: TestClient, email: str = REGISTER["email"]) -> dict[str, str]:
    response = client.post("/api/auth/register", json={**REGISTER, "email": email})
    assert response.status_code == 201
    return response.json()


def _login(client: TestClient, email: str = REGISTER["email"]) -> dict[str, str]:
    payload = {"email": email, "password": REGISTER["password"]}
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    return response.json()


def _auth_headers(tokens: dict[str, str]) -> dict[str, str]:
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def test_register_returns_public_user_without_hash(auth_app: FastAPI, client: TestClient) -> None:
    created = _register(client)

    assert created["email"] == "seeker@example.com"
    assert created["display_name"] is None
    assert created["created_at"]
    assert "password_hash" not in created


def test_register_duplicate_email_conflict(auth_app: FastAPI, client: TestClient) -> None:
    _register(client)
    other_case = {"email": "SEEKER@example.com", "password": "another-passphrase"}

    response = client.post("/api/auth/register", json=other_case)

    assert response.status_code == 409


def test_register_invalid_email_rejected(auth_app: FastAPI, client: TestClient) -> None:
    payload = {"email": "not-an-email", "password": "longenough1"}
    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 422


def test_login_returns_token_pair(auth_app: FastAPI, client: TestClient) -> None:
    _register(client)
    tokens = _login(client)

    assert tokens["token_type"] == "bearer"
    assert len(tokens["access_token"]) > 20
    assert len(tokens["refresh_token"]) > 20


def test_login_wrong_password_generic_401(auth_app: FastAPI, client: TestClient) -> None:
    _register(client)
    payload = {"email": REGISTER["email"], "password": "wrong-pass-123"}
    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_unknown_email_same_error(auth_app: FastAPI, client: TestClient) -> None:
    payload = {"email": "ghost@example.com", "password": "whatever-pass"}
    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_me_requires_token(auth_app: FastAPI, client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_returns_user(auth_app: FastAPI, client: TestClient) -> None:
    created = _register(client)
    tokens = _login(client)

    response = client.get("/api/auth/me", headers=_auth_headers(tokens))

    assert response.status_code == 200
    assert response.json()["email"] == created["email"]


def test_garbage_token_rejected(auth_app: FastAPI, client: TestClient) -> None:
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})

    assert response.status_code == 401


def test_refresh_rotation_invalidates_old(auth_app: FastAPI, client: TestClient) -> None:
    _register(client)
    first_pair = _login(client)
    second_pair = _login(client)

    rotated = client.post("/api/auth/refresh", json={"refresh_token": second_pair["refresh_token"]})
    assert rotated.status_code == 200

    reuse = client.post("/api/auth/refresh", json={"refresh_token": second_pair["refresh_token"]})
    assert reuse.status_code == 401

    sibling = client.post("/api/auth/refresh", json={"refresh_token": first_pair["refresh_token"]})
    assert sibling.status_code == 401


def test_logout_revokes_refresh(auth_app: FastAPI, client: TestClient) -> None:
    _register(client)
    tokens = _login(client)

    done = client.post("/api/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert done.status_code == 204

    after = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert after.status_code == 401


def test_authenticated_reading_stamped_and_exported(auth_app: FastAPI, client: TestClient) -> None:
    created = _register(client)
    tokens = _login(client)
    headers = _auth_headers(tokens)

    reading_payload = {"spread_id": "three-card", "question": "Where is my path heading?"}
    reading = client.post("/api/readings", json=reading_payload, headers=headers)
    assert reading.status_code == 201
    assert reading.json()["user_id"] == created["id"]

    anon_payload = {"spread_id": "single-card", "question": "Free floating question"}
    anon = client.post("/api/readings", json=anon_payload)
    assert anon.status_code == 201
    assert anon.json()["user_id"] is None

    bundle = client.get("/api/auth/me/export", headers=headers)
    assert bundle.status_code == 200
    body = bundle.json()
    assert body["user"]["email"] == created["email"]
    assert len(body["readings"]) == 1
    assert body["readings"][0]["question"] == "Where is my path heading?"


def test_delete_me_cascades(auth_app: FastAPI, client: TestClient) -> None:
    _register(client)
    tokens = _login(client)
    headers = _auth_headers(tokens)
    doomed = {"spread_id": "single-card", "question": "A doomed question"}
    client.post("/api/readings", json=doomed, headers=headers)

    deleted = client.delete("/api/auth/me", headers=headers)
    assert deleted.status_code == 204

    after = client.get("/api/auth/me", headers=headers)
    assert after.status_code == 401

    relogin_payload = {"email": REGISTER["email"], "password": REGISTER["password"]}
    relogin = client.post("/api/auth/login", json=relogin_payload)
    assert relogin.status_code == 401
