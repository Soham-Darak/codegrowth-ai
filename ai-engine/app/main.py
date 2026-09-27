import json
import os
from typing import Any, Dict

from fastapi import (
    FastAPI,
    HTTPException,
    Request,
)

from app.agents.agent_models import (
    AgentRequest,
    AgentResponse,
)

from app.agents.code_analysis_agent import (
    CodeAnalysisAgent,
)

from app.agents.evaluation_agent import (
    EvaluationAgent,
)

from app.agents.orchestrator_agent import (
    OrchestratorAgent,
)

from app.agents.repository_agent import (
    RepositoryAgent,
)

from app.models.repository_models import (
    RepositoryRequest,
)

from app.services.code_analysis_service import (
    CodeAnalysisService,
)

from app.services.evidence_validator import (
    EvidenceValidator,
)

from app.services.github_service import (
    GitHubService,
)

from app.services.llm_provider import (
    LLMProvider,
)

from app.services.llm_runtime import (
    LLMRuntime,
)

from app.services.ollama_service import (
    OllamaService,
)

from app.services.repository_service import (
    RepositoryService,
)


# ==========================================================
# APPLICATION
# ==========================================================

app = FastAPI(
    title="CodeGrowth AI Engine",
    version="0.7.0",
)


# ==========================================================
# CONFIGURATION
# ==========================================================

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5-coder:3b",
)


# ==========================================================
# LLM
# ==========================================================

llm_provider: LLMProvider = (
    OllamaService()
)

llm_runtime = LLMRuntime(
    provider=llm_provider,
    max_retries=2,
)


# ==========================================================
# SERVICES
# ==========================================================

evidence_validator = (
    EvidenceValidator()
)

github_service = (
    GitHubService()
)

repository_service = (
    RepositoryService(
        github_service=github_service
    )
)

code_analysis_service = (
    CodeAnalysisService()
)


# ==========================================================
# AGENTS
# ==========================================================

repository_agent = (
    RepositoryAgent(
        repository_service
    )
)

code_analysis_agent = (
    CodeAnalysisAgent(
        llm_runtime,
        code_analysis_service,
    )
)

evaluation_agent = (
    EvaluationAgent(
        code_analysis_agent,
        llm_runtime,
        evidence_validator,
    )
)


# ==========================================================
# ORCHESTRATOR
# ==========================================================

orchestrator = OrchestratorAgent(
    agents=[
        repository_agent,
        code_analysis_agent,
        evaluation_agent,
    ]
)


# ==========================================================
# HEALTH
# ==========================================================

@app.get("/health")
async def health():

    return {
        "service": "codegrowth-ai-engine",
        "status": "UP",
        "model": OLLAMA_MODEL,
    }


# ==========================================================
# DIRECT LLM GENERATION
# ==========================================================

@app.post("/generate")
async def generate(
    request: Request,
):

    raw_body = await request.body()

    if not raw_body:

        raise HTTPException(
            status_code=400,
            detail="Request body is empty",
        )

    try:

        body = json.loads(
            raw_body.decode(
                "utf-8"
            )
        )

    except (
        UnicodeDecodeError,
        json.JSONDecodeError,
    ) as exc:

        raise HTTPException(
            status_code=400,
            detail=f"Invalid JSON body: {exc}",
        ) from exc

    if not isinstance(
        body,
        dict,
    ):

        raise HTTPException(
            status_code=400,
            detail="Request body must be a JSON object",
        )

    prompt = body.get(
        "prompt"
    )

    if (
        not isinstance(
            prompt,
            str,
        )
        or not prompt.strip()
    ):

        raise HTTPException(
            status_code=422,
            detail=(
                "Field 'prompt' must be "
                "a non-empty string"
            ),
        )

    try:

        response = (
            await llm_runtime.generate(
                prompt
            )
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    return {
        "model": OLLAMA_MODEL,
        "response": response,
    }


# ==========================================================
# LIST AGENTS
# ==========================================================

@app.get("/agents")
async def list_agents():

    return {
        "agents": (
            orchestrator.list_agents()
        )
    }


# ==========================================================
# RUN AGENT
# ==========================================================

@app.post(
    "/agents/run",
    response_model=AgentResponse,
)
async def run_agent(
    request: AgentRequest,
):

    try:

        context = (
            request.context
            or {}
        )

        task_lower = (
            request.task.lower()
        )

        repository_keywords = [
            "inspect repository",
            "inspect repo",
            "analyze repository",
            "analyse repository",
            "analyze repo",
            "analyse repo",
            "review repository",
            "review repo",
            "repository inspection",
            "repository structure",
        ]

        is_repository_task = any(
            keyword in task_lower
            for keyword in repository_keywords
        )

        if (
            context.get(
                "repository_url"
            )
            and is_repository_task
        ):

            result = (
                await repository_agent.run(
                    task=request.task,
                    context=context,
                )
            )

            return {
                "agent": "repository-agent",
                "status": "COMPLETED",
                "result": result,
            }

        result = await orchestrator.run(
            request.task,
            context,
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


# ==========================================================
# INSPECT REPOSITORY
# ==========================================================

@app.post(
    "/repositories/inspect"
)
async def inspect_repository(
    request: RepositoryRequest,
):

    try:

        repository = (
            await repository_service
            .inspect_repository(
                repository_url=(
                    request.repository_url
                ),
                branch=request.branch,
                include_contents=(
                    request.include_contents
                ),
                max_files=request.max_files,
            )
        )

        return {
            "status": "COMPLETED",
            "repository": (
                repository.model_dump()
            ),
            "message": (
                "GitHub repository successfully "
                "retrieved and inspected."
            ),
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


# ==========================================================
# ANALYZE REPOSITORY
# ==========================================================

@app.post(
    "/repositories/analyze"
)
async def analyze_repository(
    request: RepositoryRequest,
):

    try:

        repository = (
            await repository_service
            .inspect_repository(
                repository_url=(
                    request.repository_url
                ),
                branch=request.branch,
                include_contents=True,
                max_files=request.max_files,
            )
        )

        repository_files = [
            file.model_dump()
            for file in repository.contents
        ]

        if not repository_files:

            raise RuntimeError(
                "No readable source files were retrieved "
                "from the repository."
            )

        analysis_result = (
            await code_analysis_agent.run(
                task=(
                    "Analyze the repository source code "
                    "for correctness, quality, complexity, "
                    "security, testing and documentation."
                ),
                context={
                    "repository": (
                        repository.model_dump()
                    ),
                    "repository_files": (
                        repository_files
                    ),
                },
            )
        )

        if hasattr(
            analysis_result,
            "model_dump",
        ):

            analysis_result = (
                analysis_result.model_dump()
            )

        return {
            "status": "COMPLETED",
            "repository": (
                repository.model_dump()
            ),
            "analysis": analysis_result,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


# ==========================================================
# DIRECT CODE ANALYSIS
# ==========================================================

@app.post(
    "/code/analyze"
)
async def analyze_code(
    request: Request,
):

    try:

        body = await request.json()

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid JSON request body: {exc}"
            ),
        ) from exc

    if not isinstance(
        body,
        dict,
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Request body must be a JSON object"
            ),
        )

    task = body.get(
        "task",
        "Analyze the provided source code",
    )

    context = body.get(
        "context",
        {},
    )

    if not isinstance(
        context,
        dict,
    ):

        raise HTTPException(
            status_code=422,
            detail=(
                "Field 'context' must be an object"
            ),
        )

    context = dict(
        context
    )

    if "code" in body:
        context["code"] = body["code"]

    if "language" in body:
        context["language"] = (
            body["language"]
        )

    if "file_path" in body:
        context["file_path"] = (
            body["file_path"]
        )

    try:

        result = (
            await code_analysis_agent.run(
                task,
                context,
            )
        )

        if hasattr(
            result,
            "model_dump",
        ):

            return result.model_dump()

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc