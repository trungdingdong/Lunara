import pytest
from app.llm.intent import classify_intent
from app.llm.provider import CompletionRequest, LLMProvider
from app.models.schemas import IntentCategory


class ScriptedProvider:
    def __init__(self, response: str, fail: bool = False) -> None:
        self._response = response
        self._fail = fail

    async def complete(self, request: CompletionRequest) -> str:
        if self._fail:
            raise RuntimeError("boom")
        return self._response

    async def stream(self, request: CompletionRequest):
        yield self._response


def _provider(response: str, fail: bool = False) -> LLMProvider:
    return ScriptedProvider(response, fail)


@pytest.mark.anyio
async def test_classifies_love_with_high_confidence() -> None:
    raw = '{"category": "love", "confidence": 0.92}'
    result = await classify_intent(
        _provider(raw), "Will I find love this year?", confidence_threshold=0.6
    )

    assert result.category is IntentCategory.LOVE
    assert result.confidence == 0.92


@pytest.mark.anyio
async def test_parses_fenced_json() -> None:
    raw = '```json\n{"category": "career", "confidence": 0.8}\n```'
    result = await classify_intent(
        _provider(raw), "Should I change jobs?", confidence_threshold=0.6
    )

    assert result.category is IntentCategory.CAREER


@pytest.mark.anyio
async def test_low_confidence_falls_back_to_general() -> None:
    raw = '{"category": "prosperity", "confidence": 0.3}'

    result = await classify_intent(_provider(raw), "Money?", confidence_threshold=0.6)

    assert result.category is IntentCategory.GENERAL
    assert result.confidence == 0.0


@pytest.mark.anyio
async def test_garbage_output_falls_back_to_general() -> None:
    result = await classify_intent(_provider("I am not sure!"), "hello", confidence_threshold=0.6)

    assert result.category is IntentCategory.GENERAL


@pytest.mark.anyio
async def test_unknown_category_falls_back_to_general() -> None:
    raw = '{"category": "health", "confidence": 0.99}'

    result = await classify_intent(_provider(raw), "Am I healthy?", confidence_threshold=0.6)

    assert result.category is IntentCategory.GENERAL


@pytest.mark.anyio
async def test_provider_failure_falls_back_to_general() -> None:
    result = await classify_intent(_provider("", fail=True), "anything", confidence_threshold=0.6)

    assert result.category is IntentCategory.GENERAL


@pytest.mark.anyio
async def test_question_wrapped_in_guard_tags() -> None:
    captured: list[CompletionRequest] = []

    class Capturing(ScriptedProvider):
        async def complete(self, request: CompletionRequest) -> str:
            captured.append(request)
            return '{"category": "general", "confidence": 1.0}'

    await classify_intent(Capturing(""), "Will it rain?", confidence_threshold=0.6)

    assert "<user_question>Will it rain?</user_question>" in captured[0].user
