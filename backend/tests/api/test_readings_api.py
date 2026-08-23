import json
from collections.abc import Iterator
from typing import Any

import pytest
from app.main import app
from app.store.memory import StoredReading
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def clean_store(client: TestClient) -> Iterator[None]:
    yield
    app.state.store.clear()


def _create(client: TestClient, spread_id: str = "three-card") -> StoredReading:
    payload = {"spread_id": spread_id, "question": "What does my future hold?"}
    response = client.post("/api/readings", json=payload)
    assert response.status_code == 201
    return StoredReading.model_validate(response.json())


def _parse_sse(raw: str) -> list[tuple[str, dict[str, Any]]]:
    events: list[tuple[str, dict[str, Any]]] = []
    for frame in raw.split("\n\n"):
        if not frame.strip():
            continue
        event_name = ""
        data_raw = ""
        for line in frame.splitlines():
            if line.startswith("event: "):
                event_name = line[len("event: ") :]
            elif line.startswith("data: "):
                data_raw = line[len("data: ") :]
        events.append((event_name, json.loads(data_raw)))
    return events


def test_create_reading_returns_cards_and_intent(client: TestClient) -> None:
    reading = _create(client)

    assert len(reading.drawn_cards) == 3
    assert [d.position for d in reading.drawn_cards] == ["Past", "Present", "Future"]
    assert all(len(d.card.id) > 0 for d in reading.drawn_cards)
    assert reading.question == "What does my future hold?"
    assert reading.intent_category == "general"
    assert isinstance(reading.seed, int)


def test_create_reading_celtic_cross_draws_ten(client: TestClient) -> None:
    reading = _create(client, spread_id="celtic-cross")

    assert len(reading.drawn_cards) == 10


def test_create_reading_unknown_spread_rejected(client: TestClient) -> None:
    payload = {"spread_id": "horseshoe", "question": "Anything at all?"}
    response = client.post("/api/readings", json=payload)

    assert response.status_code == 400
    assert "unknown spread" in response.json()["detail"]


@pytest.mark.parametrize(
    ("question", "match"),
    [("ab", "too_short"), ("x" * 501, "too_long")],
)
def test_create_question_validation(client: TestClient, question: str, match: str) -> None:
    response = client.post("/api/readings", json={"spread_id": "single-card", "question": question})

    assert response.status_code == 422
    errors = str(response.json()["detail"])
    assert match in errors or match.replace("_", " ") in errors


def test_stream_emits_start_tokens_done(client: TestClient) -> None:
    reading = _create(client)

    with client.stream("GET", f"/api/readings/{reading.id}/stream") as response:
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        raw = "".join(response.iter_text())

    events = _parse_sse(raw)
    names = [name for name, _ in events]

    assert names[0] == "start"
    assert events[0][1]["reading_id"] == reading.id
    assert names[-1] == "done"
    assert "token" in names

    tokens = "".join(data.get("text", "") for name, data in events if name == "token")
    assert "## Overview" in tokens
    assert "## Guidance" in tokens


def test_stream_unknown_reading_404(client: TestClient) -> None:
    response = client.get("/api/readings/does-not-exist/stream")

    assert response.status_code == 404
