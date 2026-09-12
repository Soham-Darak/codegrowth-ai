import json
import os

import httpx
from fastapi import FastAPI, HTTPException, Request

app = FastAPI(title="CodeGrowth AI Engine", version="0.1.0")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:3b")


@app.get("/health")
async def health():
    return {"service": "codegrowth-ai-engine", "status": "UP", "model": OLLAMA_MODEL}


@app.post("/generate")
async def generate(request: Request):
    raw_body = await request.body()
    if not raw_body:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Request body is empty",
                "content_length": request.headers.get("content-length"),
                "content_type": request.headers.get("content-type"),
            },
        )

    try:
        body = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON body: {exc}") from exc

    prompt = body.get("prompt") if isinstance(body, dict) else None
    if not isinstance(prompt, str) or not prompt.strip():
        raise HTTPException(status_code=422, detail="Field 'prompt' must be a non-empty string")

    payload = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {exc}") from exc

    data = response.json()
    return {"model": OLLAMA_MODEL, "response": data.get("response", "")}
