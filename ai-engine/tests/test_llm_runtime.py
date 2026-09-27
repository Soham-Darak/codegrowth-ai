"""
Tests for LLMRuntime — retry logic, prompt validation, error propagation.
"""

import pytest

from app.services.llm_provider import LLMProvider
from app.services.llm_runtime import LLMRuntime
from app.exceptions import ServiceUnavailableError, BadGatewayError


# ==============================================================
# MOCK LLM PROVIDER
# ==============================================================

class MockLLMProvider(LLMProvider):
    """Controllable mock for LLMProvider."""

    def __init__(self):
        self.generate_responses = []
        self.generate_json_responses = []
        self.call_count = 0

    async def generate(self, prompt: str) -> str:
        self.call_count += 1
        if self.generate_responses:
            response = self.generate_responses.pop(0)
            if isinstance(response, Exception):
                raise response
            return response
        return "mock response"

    async def generate_json(self, prompt: str) -> str:
        self.call_count += 1
        if self.generate_json_responses:
            response = self.generate_json_responses.pop(0)
            if isinstance(response, Exception):
                raise response
            return response
        return '{"mock": "json"}'


# ==============================================================
# CONSTRUCTOR TESTS
# ==============================================================

def test_llm_runtime_requires_provider():
    with pytest.raises(ValueError, match="LLM provider is required"):
        LLMRuntime(provider=None)


def test_llm_runtime_rejects_negative_retries():
    with pytest.raises(ValueError, match="max_retries cannot be negative"):
        LLMRuntime(provider=MockLLMProvider(), max_retries=-1)


def test_llm_runtime_accepts_zero_retries():
    runtime = LLMRuntime(provider=MockLLMProvider(), max_retries=0)
    assert runtime.max_retries == 0


# ==============================================================
# PROMPT VALIDATION
# ==============================================================

@pytest.mark.asyncio
async def test_generate_rejects_empty_prompt():
    runtime = LLMRuntime(provider=MockLLMProvider())
    with pytest.raises(ValueError, match="non-empty string"):
        await runtime.generate("")


@pytest.mark.asyncio
async def test_generate_rejects_whitespace_prompt():
    runtime = LLMRuntime(provider=MockLLMProvider())
    with pytest.raises(ValueError, match="non-empty string"):
        await runtime.generate("   ")


@pytest.mark.asyncio
async def test_generate_rejects_none_prompt():
    runtime = LLMRuntime(provider=MockLLMProvider())
    with pytest.raises(ValueError, match="non-empty string"):
        await runtime.generate(None)


@pytest.mark.asyncio
async def test_generate_json_rejects_empty_prompt():
    runtime = LLMRuntime(provider=MockLLMProvider())
    with pytest.raises(ValueError, match="non-empty string"):
        await runtime.generate_json("")


# ==============================================================
# SUCCESSFUL GENERATION
# ==============================================================

@pytest.mark.asyncio
async def test_generate_returns_provider_response():
    provider = MockLLMProvider()
    provider.generate_responses = ["Hello, world!"]
    runtime = LLMRuntime(provider=provider)

    result = await runtime.generate("test prompt")
    assert result == "Hello, world!"


@pytest.mark.asyncio
async def test_generate_json_returns_provider_response():
    provider = MockLLMProvider()
    provider.generate_json_responses = ['{"key": "value"}']
    runtime = LLMRuntime(provider=provider)

    result = await runtime.generate_json("test prompt")
    assert result == '{"key": "value"}'


# ==============================================================
# RETRY LOGIC
# ==============================================================

@pytest.mark.asyncio
async def test_generate_retries_on_runtime_error():
    provider = MockLLMProvider()
    provider.generate_responses = [
        RuntimeError("temporary failure"),
        "success after retry"
    ]
    runtime = LLMRuntime(provider=provider, max_retries=1)

    result = await runtime.generate("test prompt")
    assert result == "success after retry"
    assert provider.call_count == 2


@pytest.mark.asyncio
async def test_generate_retries_on_timeout():
    provider = MockLLMProvider()
    provider.generate_responses = [
        TimeoutError("timed out"),
        "recovered"
    ]
    runtime = LLMRuntime(provider=provider, max_retries=1)

    result = await runtime.generate("test prompt")
    assert result == "recovered"


@pytest.mark.asyncio
async def test_generate_fails_after_max_retries():
    provider = MockLLMProvider()
    provider.generate_responses = [
        RuntimeError("fail 1"),
        RuntimeError("fail 2"),
        RuntimeError("fail 3"),
    ]
    runtime = LLMRuntime(provider=provider, max_retries=2)

    with pytest.raises(ServiceUnavailableError, match="failed after 3 attempts"):
        await runtime.generate("test prompt")

    assert provider.call_count == 3


@pytest.mark.asyncio
async def test_generate_no_retries_when_max_retries_zero():
    provider = MockLLMProvider()
    provider.generate_responses = [
        RuntimeError("single failure"),
    ]
    runtime = LLMRuntime(provider=provider, max_retries=0)

    with pytest.raises(ServiceUnavailableError, match="failed after 1 attempts"):
        await runtime.generate("test prompt")

    assert provider.call_count == 1


@pytest.mark.asyncio
async def test_generate_rejects_empty_provider_response():
    provider = MockLLMProvider()
    provider.generate_responses = ["   "]
    runtime = LLMRuntime(provider=provider, max_retries=0)

    with pytest.raises(BadGatewayError):
        await runtime.generate("test prompt")
