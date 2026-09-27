# CodeGrowth AI — Implementation Plan

*This plan has been generated following the resolution of the core architecture bugs in the AI Engine.*

## PHASE 0: Repository Audit and Baseline
- **Status**: **COMPLETED** 
- **Details**: Core bugs resolved (async coroutines, orchestrator routing, repository fetching, evaluation agent string matching). The foundation is stable and functional.

## PHASE 1: Complete AI Engine Test Suite
- **Status**: **COMPLETED**
- **Details**: Implement unit and integration tests for the AI Engine to ensure the complex multi-agent orchestration does not regress. 
- **Tasks**:
  - Test `GitHubService` and `RepositoryService` mocks.
  - Test `OrchestratorAgent` routing logic.
  - Test `EvaluationAgent` deterministic fallback logic.

## PHASE 2: API Error Handling & Hardening
- **Status**: **COMPLETED**
- **Details**: Upgrade the FastAPI routes to return specific HTTP status codes (400, 404, 429, 502, 503) instead of generic 500 errors when GitHub or Ollama fails.
- **Tasks**:
  - Refactor `main.py` error handlers.

## PHASE 3: Backend Persistence Integration
- **Status**: **COMPLETED**
- **Details**: Ensure the Java Spring Boot backend can receive and store the structured Pydantic analysis output from the AI Engine into PostgreSQL.
- **Tasks**:
  - Audit Java models against Python Pydantic models.
  - Establish a webhook or API client.

## PHASE 4: Frontend Dashboard Integration
- **Details**: Connect the Next.js frontend to the Java backend to visualize the AI Engine's `CodeAnalysisResult` and `EvaluationResult` objects.

## PHASE 5: User & Progress Flow
- **Details**: Finalize authentication and link the AI results to specific student accounts.

## PHASE 6: Deployment & Polish
- **Details**: Containerize with Docker, ensure environment configuration is secure, and update documentation.
