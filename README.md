# Lunara 🔮

AI-powered tarot reading web application. Ask a question, draw your cards, and receive a streamed, intent-aware interpretation tailored to what you're asking about.

## Features

- **Intent-first readings** — every reading starts from your question (love, career, prosperity, future...). A classifier routes it to a matching interpretation style.
- **Provably fair draws** — cards are drawn server-side by a seeded RNG. The LLM never picks or invents cards; it only interprets them.
- **78-card deck** — Major + Minor Arcana with upright/reversed meanings, sourced from a curated open dataset.
- **Four spreads** — single card, three-card (Past/Present/Future), five-card (Situation/Challenge/Root Cause/Advice/Outcome), Celtic cross (10 positions).
- **Reversals** — configurable rate (~35% by default).
- **Live streaming** — interpretations stream token-by-token over Server-Sent Events while your cards flip.
- **Pluggable LLM providers** — Anthropic Claude, local Ollama, or an offline mock. Swap via one environment variable.

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Python 3.12 (managed with `uv`) |
| Backend | FastAPI + Pydantic v2 |
| LLM | Anthropic / Ollama / Mock behind a `LLMProvider` protocol |
| Streaming | Server-Sent Events |
| Data | Versioned deck JSON (`data/tarot_deck.json`) |
| Quality | Ruff, Pyright (strict), Pytest |
| CI | GitHub Actions |
| Packaging | Docker multi-stage builds + docker-compose |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory
│   ├── api/                 # HTTP + SSE endpoints
│   ├── core/config.py       # pydantic-settings (TAROT_ prefixed env vars)
│   ├── domain/              # deck loading, DrawService, spread definitions
│   ├── llm/                 # provider adapters, intent classifier, prompts
│   ├── models/schemas.py    # Pydantic contracts
│   └── store/memory.py      # in-memory reading store
├── data/tarot_deck.json     # 78-card dataset
├── scripts/import_deck.py   # rebuilds tarot_deck.json from the source dataset
└── tests/
```

## Getting Started

### Prerequisites

- [uv](https://docs.astral.sh/uv/) (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Python 3.12 (uv installs it automatically)
- Optional: [Ollama](https://ollama.com) for local models, or an Anthropic API key for hosted inference

### Setup

```bash
cd backend
uv sync
cp .env.example .env
```

The app runs out of the box with the offline mock provider — no API keys required.

To use a real model, edit `.env`:

```bash
# Hosted (Anthropic)
TAROT_LLM_PROVIDER=anthropic
TAROT_ANTHROPIC_API_KEY=sk-ant-your-key-here

# Or local (Ollama)
TAROT_LLM_PROVIDER=ollama
TAROT_OLLAMA_BASE_URL=http://localhost:11434
TAROT_OLLAMA_MODEL=llama3.2
```

### Run

```bash
uv run uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000
- Interactive docs: http://127.0.0.1:8000/docs

### Run with Docker

```bash
docker compose up --build
```

Starts the API plus a PostgreSQL 17 database (migrations apply automatically on boot). The API listens on http://localhost:8000. To use Anthropic instead of the mock provider:

```bash
TAROT_LLM_PROVIDER=anthropic TAROT_ANTHROPIC_API_KEY=sk-ant-... docker compose up --build
```

### Try It

```bash
# Draw cards for a question
curl -X POST http://127.0.0.1:8000/api/readings \
  -H "Content-Type: application/json" \
  -d '{"spread_id": "three-card", "question": "What should I focus on this month?"}'

# Stream the interpretation (use the reading id from above)
curl -N http://127.0.0.1:8000/api/readings/<READING_ID>/stream
```

The POST returns the drawn cards immediately; the GET streams SSE events (`start`, `token*`, `done`).

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `POST` | `/api/readings` | Create a reading: draws cards, classifies intent |
| `GET` | `/api/readings/{id}/stream` | Stream the interpretation via SSE |

Available spreads: `single-card`, `three-card`, `five-card`, `celtic-cross`.

## Configuration

All settings are environment variables with the `TAROT_` prefix (see `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `TAROT_LLM_PROVIDER` | `mock` | `anthropic`, `ollama`, or `mock` |
| `TAROT_REVERSAL_RATE` | `0.35` | Probability a drawn card is reversed |
| `TAROT_INTENT_CONFIDENCE_THRESHOLD` | `0.6` | Below this, questions classify as `general` |
| `TAROT_ANTHROPIC_API_KEY` | — | Required when provider is `anthropic` |
| `TAROT_OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `TAROT_OLLAMA_MODEL` | `llama3.2` | Ollama model name |

## Development

```bash
cd backend

uv sync                                   # install dependencies
uv run ruff check .                       # lint
uv run ruff format .                      # format
uv run pyright                            # type check (strict)
uv run pytest                             # run tests
uv run python scripts/import_deck.py      # rebuild deck data from source dataset
```

Pre-commit hooks are available:

```bash
uvx pre-commit install
```
