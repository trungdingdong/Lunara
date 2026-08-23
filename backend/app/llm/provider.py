from __future__ import annotations

import asyncio
import hashlib
import json
import re
from collections.abc import AsyncIterator
from typing import Any, Protocol, runtime_checkable

import httpx
from anthropic import AsyncAnthropic
from pydantic import BaseModel, Field

from app.core.config import Settings


class ProviderError(RuntimeError):
    pass


class CompletionRequest(BaseModel):
    system: str
    user: str
    max_tokens: int = Field(default=2048, ge=1)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)


@runtime_checkable
class LLMProvider(Protocol):
    async def complete(self, request: CompletionRequest) -> str: ...

    def stream(self, request: CompletionRequest) -> AsyncIterator[str]: ...


_MOCK_SECTIONS = """## Overview

The cards surrounding {topic} form a coherent arc. Mock reading variant {variant} begins here.

## Card-by-card

Each position carries its own weight in this spread, and the drawn cards answer {topic} in sequence.

## Synthesis

Read together, the spread suggests movement around {topic}: tension resolving into direction.

## Direct Answer

Regarding {topic}: the spread points to change already underway; act with intention.

## Guidance

Move deliberately, revisit {topic} after this phase settles,
and keep records of what unfolds."""


class MockProvider:
    def __init__(self, chunk_size: int = 12, delay_seconds: float = 0.0) -> None:
        self._chunk_size = chunk_size
        self._delay_seconds = delay_seconds

    async def complete(self, request: CompletionRequest) -> str:
        chunks = [chunk async for chunk in self.stream(request)]
        return "".join(chunks)

    async def stream(self, request: CompletionRequest) -> AsyncIterator[str]:
        text = self._compose(request.system, request.user)
        for start in range(0, len(text), self._chunk_size):
            yield text[start : start + self._chunk_size]
            if self._delay_seconds > 0:
                await asyncio.sleep(self._delay_seconds)

    @staticmethod
    def _compose(system: str, user: str) -> str:
        digest = hashlib.sha256((system + user).encode("utf-8")).hexdigest()
        variant = int(digest[:8], 16) % 3
        found = re.findall(r"[A-Za-z']+", user)
        topic = " ".join(found[:8]) if found else "your journey"
        return _MOCK_SECTIONS.format(topic=topic, variant=variant)


class AnthropicProvider:
    def __init__(self, client: AsyncAnthropic, model: str) -> None:
        self._client = client
        self._model = model

    async def complete(self, request: CompletionRequest) -> str:
        try:
            message = await self._client.messages.create(
                model=self._model,
                system=request.system,
                messages=[{"role": "user", "content": request.user}],
                max_tokens=request.max_tokens,
            )
        except Exception as exc:
            raise ProviderError(f"anthropic completion failed: {exc}") from exc
        return "".join(block.text for block in message.content if block.type == "text")

    async def stream(self, request: CompletionRequest) -> AsyncIterator[str]:
        try:
            async with self._client.messages.stream(
                model=self._model,
                system=request.system,
                messages=[{"role": "user", "content": request.user}],
                max_tokens=request.max_tokens,
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as exc:
            raise ProviderError(f"anthropic stream failed: {exc}") from exc


class OllamaProvider:
    def __init__(self, client: httpx.AsyncClient, model: str) -> None:
        self._client = client
        self._model = model

    def build_payload(self, request: CompletionRequest, *, stream: bool) -> dict[str, Any]:
        return {
            "model": self._model,
            "messages": [
                {"role": "system", "content": request.system},
                {"role": "user", "content": request.user},
            ],
            "stream": stream,
            "options": {"temperature": request.temperature, "num_predict": request.max_tokens},
        }

    async def complete(self, request: CompletionRequest) -> str:
        try:
            response = await self._client.post(
                "/api/chat", json=self.build_payload(request, stream=False)
            )
            response.raise_for_status()
            body = response.json()
        except Exception as exc:
            raise ProviderError(f"ollama completion failed: {exc}") from exc
        content = body.get("message", {}).get("content")
        if not isinstance(content, str):
            raise ProviderError("ollama returned no message content")
        return content

    async def stream(self, request: CompletionRequest) -> AsyncIterator[str]:
        try:
            payload = self.build_payload(request, stream=True)
            async with self._client.stream("POST", "/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    event = json.loads(line)
                    delta = event.get("message", {}).get("content")
                    if isinstance(delta, str) and delta:
                        yield delta
                    if event.get("done"):
                        break
        except Exception as exc:
            raise ProviderError(f"ollama stream failed: {exc}") from exc


def build_provider(settings: Settings) -> LLMProvider:
    match settings.llm_provider:
        case "mock":
            return MockProvider()
        case "anthropic":
            assert settings.anthropic_api_key is not None
            return AnthropicProvider(
                client=AsyncAnthropic(api_key=settings.anthropic_api_key),
                model=settings.anthropic_model,
            )
        case "ollama":
            http_client = httpx.AsyncClient(
                base_url=settings.ollama_base_url, timeout=httpx.Timeout(120.0)
            )
            return OllamaProvider(client=http_client, model=settings.ollama_model)
        case _:
            raise ProviderError(f"unknown llm provider: {settings.llm_provider}")
