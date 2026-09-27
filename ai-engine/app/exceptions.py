"""
Custom exceptions for the CodeGrowth AI engine.
These allow services to throw specific domain errors that the
FastAPI router can map to HTTP status codes.
"""

class ExternalServiceError(Exception):
    """Base exception for external service failures."""
    pass


class ResourceNotFoundError(ExternalServiceError):
    """Raised when a resource (e.g. GitHub repository) is not found (404)."""
    pass


class AuthenticationError(ExternalServiceError):
    """Raised when authentication fails (401)."""
    pass


class AuthorizationError(ExternalServiceError):
    """Raised when access is forbidden (403)."""
    pass


class RateLimitError(ExternalServiceError):
    """Raised when rate limits are exceeded (429)."""
    pass


class ServiceUnavailableError(ExternalServiceError):
    """Raised when a service is down or unreachable (503)."""
    pass


class BadGatewayError(ExternalServiceError):
    """Raised when a service returns an invalid response (502)."""
    pass
