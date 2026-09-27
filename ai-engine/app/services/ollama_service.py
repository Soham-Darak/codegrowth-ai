import os

import httpx

from app.services.llm_provider import LLMProvider


class OllamaService(LLMProvider):

    def __init__(self):
        self.base_url = os.getenv(
            "OLLAMA_BASE_URL",
            "http://localhost:11434"
        ).rstrip("/")

        self.model = os.getenv(
            "OLLAMA_MODEL",
            "qwen2.5-coder:3b"
        )

        self.timeout = float(
            os.getenv(
                "OLLAMA_TIMEOUT",
                "120"
            )
        )

    async def generate(
        self,
        prompt: str
    ) -> str:

        if not isinstance(prompt, str) or not prompt.strip():
            raise ValueError(
                "Prompt must be a non-empty string"
            )

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )

                response.raise_for_status()

        except httpx.HTTPError as exc:

            raise RuntimeError(
                f"Ollama request failed: {exc}"
            ) from exc

        data = response.json()

        result = data.get(
            "response",
            ""
        )

        if not isinstance(result, str):
            raise RuntimeError(
                "Ollama returned an invalid response"
            )

        return result

    async def generate_json(
        self,
        prompt: str
    ) -> str:

        if not isinstance(prompt, str) or not prompt.strip():
            raise ValueError(
                "Prompt must be a non-empty string"
            )

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )

                response.raise_for_status()

        except httpx.HTTPError as exc:

            raise RuntimeError(
                f"Ollama JSON request failed: {exc}"
            ) from exc

        data = response.json()

        result = data.get(
            "response",
            ""
        )

        if not isinstance(result, str):
            raise RuntimeError(
                "Ollama returned an invalid JSON response"
            )

        return result