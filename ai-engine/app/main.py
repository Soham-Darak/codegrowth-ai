import os

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="CodeGrowth AI Engine", version="0.1.0")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")


class GenerateRequest(BaseModel):
    prompt: str


@app.get("/health")
async def health():
    return {"service": "codegrowth-ai-engine", "status": "UP", "model": OLLAMA_MODEL}


@app.post("/generate")
async def generate(request: GenerateRequest):
    payload = {"model": OLLAMA_MODEL, "prompt": request.prompt, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {exc}") from exc

    data = response.json()
    return {"model": OLLAMA_MODEL, "response": data.get("response", "")}
