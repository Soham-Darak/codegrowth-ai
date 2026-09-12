import os

import httpx


class OllamaService:

    def __init__(self):

        self.base_url = os.getenv(
            "OLLAMA_BASE_URL",
            "http://localhost:11434"
        )

        self.model = os.getenv(
            "OLLAMA_MODEL",
            "qwen2.5-coder:3b"
        )

    async def generate(
        self,
        prompt: str
    ) -> str:

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }

        try:

            async with httpx.AsyncClient(
                timeout=120.0
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

        return data.get(
            "response",
            ""
        )