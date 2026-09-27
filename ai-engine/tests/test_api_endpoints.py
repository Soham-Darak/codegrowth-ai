"""
Tests for FastAPI endpoints — /health, /agents, /agents/run, /generate.

Uses httpx.AsyncClient with the FastAPI test client. All external services
(Ollama, GitHub) are mocked so these tests run offline.
"""

import pytest
from unittest.mock import AsyncMock, patch

from httpx import AsyncClient, ASGITransport
from app.main import app


# ==============================================================
# HEALTH ENDPOINT
# ==============================================================

@pytest.mark.asyncio
async def test_health_returns_200():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "codegrowth-ai-engine"
    assert "model" in data


# ==============================================================
# LIST AGENTS ENDPOINT
# ==============================================================

@pytest.mark.asyncio
async def test_list_agents_returns_registered():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/agents")

    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    agent_names = [a["name"] for a in data["agents"]]
    assert "repository-agent" in agent_names
    assert "code-analysis-agent" in agent_names
    assert "evaluation-agent" in agent_names


# ==============================================================
# GENERATE ENDPOINT
# ==============================================================

@pytest.mark.asyncio
async def test_generate_rejects_empty_body():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/generate", content=b"")

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_generate_rejects_invalid_json():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/generate",
            content=b"not json",
            headers={"content-type": "application/json"},
        )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_generate_rejects_missing_prompt():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/generate", json={"foo": "bar"})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_generate_rejects_empty_prompt():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/generate", json={"prompt": ""})

    assert response.status_code == 422


# ==============================================================
# AGENT RUN ENDPOINT — VALIDATION
# ==============================================================

@pytest.mark.asyncio
async def test_agent_run_rejects_empty_task():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/agents/run", json={"task": ""})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_agent_run_rejects_missing_task():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/agents/run", json={})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_agent_run_returns_400_for_unroutable_task():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/agents/run", json={
            "task": "make me a sandwich",
        })

    assert response.status_code == 400


# ==============================================================
# REPOSITORY INSPECT ENDPOINT — VALIDATION
# ==============================================================

@pytest.mark.asyncio
async def test_inspect_rejects_missing_url():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/repositories/inspect", json={})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_inspect_rejects_empty_url():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/repositories/inspect",
            json={"repository_url": ""},
        )

    assert response.status_code == 422


# ==============================================================
# CODE ANALYZE ENDPOINT — VALIDATION
# ==============================================================

@pytest.mark.asyncio
async def test_code_analyze_rejects_non_object_body():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/code/analyze",
            content=b'"just a string"',
            headers={"content-type": "application/json"},
        )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_code_analyze_rejects_non_object_context():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/code/analyze", json={
            "task": "analyze",
            "context": "not an object",
        })

    assert response.status_code == 422
