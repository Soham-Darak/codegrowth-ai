import json
import os

from fastapi import FastAPI, HTTPException, Request

from app.agents.agent_models import (
    AgentRequest,
    AgentResponse
)
from app.agents.code_analysis_agent import CodeAnalysisAgent
from app.agents.evaluation_agent import EvaluationAgent
from app.agents.orchestrator_agent import OrchestratorAgent
from app.services.ollama_service import OllamaService


app = FastAPI(
    title="CodeGrowth AI Engine",
    version="0.3.0"
)


# --------------------------------------------------
# Configuration
# --------------------------------------------------

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://localhost:11434"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5-coder:3b"
)


# --------------------------------------------------
# Services
# --------------------------------------------------

ollama_service = OllamaService()


# --------------------------------------------------
# Agents
# --------------------------------------------------

code_analysis_agent = CodeAnalysisAgent(
    ollama_service
)

evaluation_agent = EvaluationAgent(
    code_analysis_agent,
    ollama_service
)


# --------------------------------------------------
# Orchestrator
# --------------------------------------------------

orchestrator = OrchestratorAgent(
    agents=[
        code_analysis_agent,
        evaluation_agent
    ]
)


# --------------------------------------------------
# Health endpoint
# --------------------------------------------------

@app.get("/health")
async def health():

    return {
        "service": "codegrowth-ai-engine",
        "status": "UP",
        "model": OLLAMA_MODEL
    }


# --------------------------------------------------
# Direct Ollama generation
# --------------------------------------------------

@app.post("/generate")
async def generate(
    request: Request
):

    raw_body = await request.body()

    if not raw_body:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Request body is empty",
                "content_length": request.headers.get(
                    "content-length"
                ),
                "content_type": request.headers.get(
                    "content-type"
                )
            }
        )

    try:

        body = json.loads(
            raw_body.decode("utf-8")
        )

    except (
        UnicodeDecodeError,
        json.JSONDecodeError
    ) as exc:

        raise HTTPException(
            status_code=400,
            detail=f"Invalid JSON body: {exc}"
        ) from exc

    prompt = (
        body.get("prompt")
        if isinstance(body, dict)
        else None
    )

    if not isinstance(
        prompt,
        str
    ) or not prompt.strip():

        raise HTTPException(
            status_code=422,
            detail=(
                "Field 'prompt' must be a "
                "non-empty string"
            )
        )

    try:

        response = await ollama_service.generate(
            prompt
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        ) from exc

    return {
        "model": OLLAMA_MODEL,
        "response": response
    }


# --------------------------------------------------
# List available agents
# --------------------------------------------------

@app.get("/agents")
async def list_agents():

    return {
        "agents": orchestrator.list_agents()
    }


# --------------------------------------------------
# Execute agent through orchestrator
# --------------------------------------------------

@app.post(
    "/agents/run",
    response_model=AgentResponse
)
async def run_agent(
    request: AgentRequest
):

    try:

        result = await orchestrator.run(
            request.task,
            request.context
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        ) from exc