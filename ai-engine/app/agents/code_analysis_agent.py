import json
from typing import Any, Dict

from pydantic import ValidationError

from app.agents.base_agent import BaseAgent
from app.models.code_analysis_models import CodeAnalysisResult
from app.services.llm_runtime import LLMRuntime

class CodeAnalysisAgent(BaseAgent):

    name = "code-analysis-agent"

    description = (
        "Analyzes source code for correctness, quality, "
        "complexity, security, testing and documentation."
    )

    def __init__(
        self,
        llm_runtime: LLMRuntime
    ):
        self.llm_runtime = llm_runtime

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> CodeAnalysisResult:

        context = context or {}

        code = context.get(
            "code",
            ""
        )

        if not isinstance(code, str) or not code.strip():

            raise ValueError(
                "Code is required for code analysis"
            )

        # ==================================================
        # BUILD ANALYSIS PROMPT
        # ==================================================

        prompt_parts = [
            "You are the CodeGrowth AI Code Analysis Agent.",
            "",
            "Your task is to analyze student source code.",
            "",
            "Task:",
            task,
            "",
            "Source Code:",
            "```text",
            code,
            "```",
            "",
            "Evaluate the code using exactly these six dimensions:",
            "",
            "1. Correctness",
            "2. Code Quality",
            "3. Complexity",
            "4. Security",
            "5. Testing",
            "6. Documentation",
            "",
            "For every dimension, provide a score from 0 to 100.",
            "",
            "Scoring guidance:",
            "0-20   = Very Poor",
            "21-40  = Poor",
            "41-60  = Average",
            "61-80  = Good",
            "81-100 = Excellent",
            "",
            "Also provide:",
            "- Overall score",
            "- Strengths",
            "- Weaknesses",
            "- Improvement suggestions",
            "",
            "Important instructions:",
            "- Return ONLY valid JSON.",
            "- Do not return Markdown.",
            "- Do not use a JSON code block.",
            "- Do not include explanations outside the JSON.",
            "- All scores must be numbers between 0 and 100.",
            "- Strengths must be an array of strings.",
            "- Weaknesses must be an array of strings.",
            "- Improvement suggestions must be an array of strings.",
            "",
            "Return exactly these JSON fields:",
            "",
            "correctness_score",
            "code_quality_score",
            "complexity_score",
            "security_score",
            "testing_score",
            "documentation_score",
            "overall_score",
            "strengths",
            "weaknesses",
            "improvement_suggestions"
        ]

        prompt = "\n".join(
            prompt_parts
        )

        # ==================================================
        # GENERATE STRUCTURED RESULT
        # ==================================================

        raw_result = await self.llm_runtime.generate_json(
            prompt
        )

        # ==================================================
        # PARSE JSON
        # ==================================================

        try:

            parsed_result = json.loads(
                raw_result
            )

        except json.JSONDecodeError as exc:

            raise RuntimeError(
                "AI returned invalid JSON"
            ) from exc

        # ==================================================
        # VALIDATE RESULT
        # ==================================================

        try:

            validated_result = (
                CodeAnalysisResult.model_validate(
                    parsed_result
                )
            )

        except ValidationError as exc:

            raise RuntimeError(
                f"AI analysis failed validation: {exc}"
            ) from exc

        return validated_result