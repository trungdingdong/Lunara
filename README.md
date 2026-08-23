# Tarot Reader

A production-grade AI tarot reading web application, built as a hands-on vehicle for learning AI engineering (author background: DevOps transitioning into AI).

## Goals

- Ship a **production-quality product**, not a demo: tests, CI, observability, containerization.
- Learn core AI engineering practices: prompt design, LLM provider abstraction, streaming, structured outputs, tracing, and evals.
- Answer to "do we need RAG?": **No**. Prompts embed only the drawn cards' full entries from the deck JSON (~a few hundred tokens), so retrieval adds nothing at this scale. RAG is deferred and only revisited if we add a large corpus (e.g., full tarot books or reading history search).

## Core Architecture Decisions

### 1. Randomness lives in code, not the LLM
- Card draws are performed server-side by a seeded, injected RNG (`DrawService`) — deterministic under test, provably fair, and never hallucinated.
- The LLM's only job is **interpretation**: it receives the drawn cards (name, orientation, position in spread) and generates the narrative.
- Never ask the model "draw three cards" — that would be untestable and biased.

### 2. LLM provider abstraction from day one
- A `LLMProvider` protocol wraps all model calls; concrete adapters for Anthropic Claude (default), Ollama (local), and `MockProvider` (tests/CI).
- Provider selection via environment variable — swapping vendors requires no code changes.
- Protects against the user not having an API key yet: develop against Ollama/Mock until a key is available.

### 3. Streaming via SSE for the reading UX
- `POST /api/readings` returns the drawn cards immediately so the UI can animate card flips while text generates.
- `GET /api/readings/{id}/stream` streams interpretation tokens over Server-Sent Events.

### 4. Card meanings as versioned data
- `data/tarot_deck.json` holds all 78 cards (Major + Minor Arcana): name, arcana, suit, rank, upright/reversed keywords & meanings.
- Single source of truth for prompts **and** eval fixtures.
- Prompts embed only the drawn cards' full entries plus spread position semantics — never the whole deck.

### 5. Readings are intent-first
- Every reading begins with a required seeker question (free text, max 500 chars) — love life, prosperity, career, future, anything.
- A cheap structured-output classifier call routes the question to an `IntentCategory` (`love`, `career`, `prosperity`, `future`, `general`) before interpretation; low confidence or parse failure falls back to `GENERAL`.
- The category selects a versioned prompt fragment (tone + focus areas); synthesis instructions stay constant across categories.
- Intent shapes **interpretation only** — never which cards are drawn (decision #1 stands).
- The question is untrusted input: length-capped, wrapped in `<user_question>` delimiters, treated as topic — never as instructions overriding the system role.
- Interpretation streams as markdown sections: Overview → Card-by-card → Synthesis → Direct Answer → Guidance.

## Product Scope

- **Spreads:** single card, three-card (past/present/future), Celtic cross (10 named positions).
- **Intent-first readings:** every reading is driven by the user's question; interpretation adapts to the detected intent category.
- **Reversals:** supported, configurable rate (~35% default).
- **Interface:** web page (React) — pick a spread, draw cards with flip animation, stream the AI interpretation.

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | Python 3.12 | Managed with `uv` |
| Backend | FastAPI + Pydantic v2 | Async, typed contracts |
| Frontend | Vite + React + TypeScript | SSE consumption, card flip animations |
| Database | SQLite (dev) → Postgres (prod) | Via SQLAlchemy + Alembic migrations from day one |
| Observability | Langfuse (self-hosted) | Prompt/response tracing, token & cost tracking |
| Evals | promptfoo + custom pytest harness | Prompt regression testing |
| Packaging | Docker multi-stage builds + docker-compose | One command to run everything locally |
| CI | GitHub Actions | ruff, pyright, pytest on every push |

## API Design

```
POST /api/readings                  # create reading: draws cards, classifies intent, returns cards + intent_category immediately
GET  /api/readings/{id}/stream      # SSE: streamed markdown interpretation tokens
GET  /api/spreads                   # list available spreads
GET  /api/readings                  # reading history
```

Core domain types (Pydantic): `Card`, `DrawnCard(card, reversed, position)`, `Spread`, `IntentCategory(love|career|prosperity|future|general)`, `ReadingRequest(spread_id, question)` — question required.

## Planned Project Structure

```
backend/
  app/
    main.py                 # FastAPI app factory
    api/routes.py           # HTTP/SSE endpoints
    core/config.py          # pydantic-settings, env-driven config
    domain/deck.py          # deck loading, DrawService (seeded RNG)
    domain/spreads.py       # spread definitions & position semantics
    llm/provider.py         # LLMProvider protocol + Anthropic/Ollama/Mock adapters
    llm/intent.py           # question → IntentCategory classifier (structured output, GENERAL fallback)
    llm/prompts.py          # versioned base template + per-intent category fragments
    models/schemas.py       # Pydantic models
  data/tarot_deck.json      # 78 cards, versioned dataset
  tests/
frontend/                   # Vite + React + TS
docker-compose.yml
.github/workflows/ci.yml
```

## Roadmap

Each phase ends runnable — no phase leaves the app broken.

### Phase 0 — Scaffolding
`uv` project init, ruff + pyright strict, pytest, pre-commit hooks, GitHub Actions CI skeleton.

### Phase 1 — Domain core (no LLM)
- `data/tarot_deck.json`: all 78 cards with keywords/meanings per orientation.
- Spread definitions incl. Celtic cross named positions.
- `DrawService` with injected/seeded RNG; Pydantic models.
- Tests: deck integrity (78 unique cards), seed determinism, duplicate-free draws.

### Phase 2 — LLM integration
- `LLMProvider` protocol; MockProvider, Anthropic adapter, Ollama adapter.
- Required `question` on `ReadingRequest`; intent classifier (structured output, GENERAL fallback).
- Prompt v2 (`v2-intent`): per-category fragments, markdown section contract, prompt-injection guards.
- SSE streaming endpoint wired end-to-end; `intent_category` returned at creation.
- Tests: classifier determinism + fallback, fragment coverage per category, prompt snapshots, guard markers.

### Phase 3 — Persistence & history
- SQLAlchemy models + Alembic migrations; save readings (incl. question + intent category), list history, replay past readings.

### Phase 4 — Frontend
- React UI: question input, spread picker, animated card flips, live-streaming interpretation, intent badge, history view.

### Phase 5 — Production hardening
- Docker multi-stage build, docker-compose (api + db + langfuse), rate limiting, error handling, structured logging, Langfuse tracing on all LLM calls.

### Phase 6 — Stretch
- Evals pipeline (promptfoo + custom pytest scenarios): `(seed, spread, question)` fixture triples with per-category assertions; caching, optional auth, revisit RAG only if a large corpus is added.

## Open Decisions

1. **Deploy target for Phase 5:** Fly.io/Railway (simple PaaS) vs Kubernetes (leverages DevOps background). Unresolved — defer until Phase 5.
2. **LLM access:** no API key confirmed yet; mitigated by provider abstraction (develop against Ollama/Mock).
