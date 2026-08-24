from fastapi.testclient import TestClient


def test_list_spreads_returns_all_four(client: TestClient) -> None:
    response = client.get("/api/spreads")

    assert response.status_code == 200
    spreads = response.json()
    assert {spread["id"] for spread in spreads} == {
        "single-card",
        "three-card",
        "five-card",
        "celtic-cross",
    }
    for spread in spreads:
        assert spread["name"]
        assert len(spread["positions"]) >= 1
