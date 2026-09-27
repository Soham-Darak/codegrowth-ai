"""
Tests for API endpoint error mapping (Phase 2).
Verifies that custom domain exceptions are correctly mapped to HTTP status codes.
"""

import pytest
from unittest.mock import patch, AsyncMock

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.exceptions import (
    ResourceNotFoundError,
    RateLimitError,
    ServiceUnavailableError,
    AuthenticationError,
    AuthorizationError,
)

# ==============================================================
# ERROR MAPPING TESTS
# ==============================================================

@pytest.mark.asyncio
async def test_resource_not_found_returns_404():
    """Verify ResourceNotFoundError maps to 404."""
    with patch("app.main.repository_service.inspect_repository", new_callable=AsyncMock) as mock_inspect:
        mock_inspect.side_effect = ResourceNotFoundError("Repository not found")
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/repositories/inspect",
                json={"repository_url": "https://github.com/owner/repo"}
            )
            
        assert response.status_code == 404
        assert "Repository not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_rate_limit_error_returns_429():
    """Verify RateLimitError maps to 429."""
    with patch("app.main.repository_service.inspect_repository", new_callable=AsyncMock) as mock_inspect:
        mock_inspect.side_effect = RateLimitError("Rate limit exceeded")
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/repositories/inspect",
                json={"repository_url": "https://github.com/owner/repo"}
            )
            
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.json()["detail"]


@pytest.mark.asyncio
async def test_authentication_error_returns_401():
    """Verify AuthenticationError maps to 401."""
    with patch("app.main.repository_service.inspect_repository", new_callable=AsyncMock) as mock_inspect:
        mock_inspect.side_effect = AuthenticationError("Auth failed")
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/repositories/inspect",
                json={"repository_url": "https://github.com/owner/repo"}
            )
            
        assert response.status_code == 401
        assert "Auth failed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_authorization_error_returns_403():
    """Verify AuthorizationError maps to 403."""
    with patch("app.main.repository_service.inspect_repository", new_callable=AsyncMock) as mock_inspect:
        mock_inspect.side_effect = AuthorizationError("Forbidden")
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/repositories/inspect",
                json={"repository_url": "https://github.com/owner/repo"}
            )
            
        assert response.status_code == 403
        assert "Forbidden" in response.json()["detail"]


@pytest.mark.asyncio
async def test_service_unavailable_returns_503():
    """Verify ServiceUnavailableError maps to 503."""
    with patch("app.main.repository_service.inspect_repository", new_callable=AsyncMock) as mock_inspect:
        mock_inspect.side_effect = ServiceUnavailableError("GitHub down")
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/repositories/inspect",
                json={"repository_url": "https://github.com/owner/repo"}
            )
            
        assert response.status_code == 503
        assert "GitHub down" in response.json()["detail"]
