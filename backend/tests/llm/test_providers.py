import httpx
import pytest
from anthropic import AsyncAnthropic
from app.core.config import Settings
from app.llm.provider import (
    AnthropicProvider,
    CompletionRequest,
    LLMProvider,
    MockProvider,
    OllamaProvider,
    ProviderError,
    build_provider,
)

REQUEST = CompletionRequest(system="system prompt", user="tell me about love")


def test_mock_is_llm_provider() -> None:
    assert isinstance(MockProvider(), LLMProvider)


@pytest.mark.anyio
async def test_mock_complete_deterministic() -> None:
    first = MockProvider()
    second = MockProvider()

    assert await first.complete(REQUEST) == await second.complete(REQUEST)


@pytest.mark.anyio
async def test_mock_stream_matches_complete() -> None:
    provider = MockProvider()

    streamed = "".join([chunk async for chunk in provider.stream(REQUEST)])
    completed = await provider.complete(REQUEST)

    assert streamed == completed


@pytest.mark.anyio
async def test_mock_contains_section_contract() -> None:
    provider = MockProvider()
    text = await provider.complete(REQUEST)
    headers = (
        "## Overview",
        "## Card-by-card",
        "## Synthesis",
        "## Direct Answer",
        "## Guidance",
    )

    for header in headers:
        assert header in text


def test_anthropic_provider_constructs() -> None:
    client = AsyncAnthropic(api_key="sk-test")
    provider = AnthropicProvider(client=client, model="claude-sonnet-4-5")

    assert isinstance(provider, LLMProvider)


def test_ollama_payload_shape() -> None:
    http_client = httpx.AsyncClient(base_url="http://localhost:11434")
    provider = OllamaProvider(client=http_client, model="test-model")
    request = CompletionRequest(system="sys", user="usr", max_tokens=10, temperature=0.25)

    payload = provider.build_payload(request, stream=False)

    assert payload["model"] == "test-model"
    assert payload["stream"] is False
    messages = payload["messages"]
    assert messages[0] == {"role": "system", "content": "sys"}
    assert messages[1] == {"role": "user", "content": "usr"}
    assert payload["options"] == {"temperature": 0.25, "num_predict": 10}


def test_build_provider_factory() -> None:
    settings = Settings(llm_provider="mock")

    assert isinstance(build_provider(settings), MockProvider)


def test_unknown_provider_rejected() -> None:
    settings = Settings(llm_provider="mock", anthropic_model="")
    object.__setattr__(settings, "llm_provider", "bogus")

    with pytest.raises(ProviderError):
        build_provider(settings)


def test_settings_require_key_for_anthropic() -> None:
    with pytest.raises(ValueError, match="TAROT_ANTHROPIC_API_KEY"):
        Settings(llm_provider="anthropic")
