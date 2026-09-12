from typing import Any, Dict

from app.agents.base_agent import BaseAgent
from app.services.ollama_service import OllamaService


class CodeAnalysisAgent(BaseAgent):

    name = "code-analysis-agent"

    description = (
        "Analyzes source code for correctness, quality, "
        "complexity, security, testing and best practices."
    )

    def __init__(
        self,
        ollama_service: OllamaService
    ):
        self.ollama_service = ollama_service

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> str:

        context = context or {}

        code = context.get("code", "")

        if not code:
            raise ValueError(
                "Code is required for code analysis"
            )

        prompt = f"""
You are the CodeGrowth AI Code Analysis Agent.

Analyze the following source code.

Task:
{task}

Source Code:
```text
{code}
```
"""

        return await self.ollama_service.generate(prompt)