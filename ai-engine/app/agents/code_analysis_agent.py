import json
from typing import Any, Dict, List

from pydantic import ValidationError

from app.agents.base_agent import BaseAgent

from app.models.code_analysis_models import (
    CodeAnalysisResult,
    DeterministicAnalysisResult,
)

from app.models.repository_models import (
    RepositoryFileContent,
)

from app.services.code_analysis_service import (
    CodeAnalysisService,
)

from app.services.llm_runtime import LLMRuntime


class CodeAnalysisAgent(BaseAgent):

    name = "code-analysis-agent"

    description = (
        "Analyzes source code and repositories using "
        "deterministic security and quality checks "
        "combined with AI-assisted code analysis."
    )

    def __init__(
        self,
        llm_runtime: LLMRuntime,
        code_analysis_service: CodeAnalysisService
    ):

        self.llm_runtime = llm_runtime

        self.code_analysis_service = (
            code_analysis_service
        )

    # ========================================================
    # RUN
    # ========================================================

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> CodeAnalysisResult:

        context = context or {}

        code = context.get(
            "code"
        )

        repository_files = context.get(
            "repository_files"
        )

        language = context.get(
            "language"
        )

        file_path = context.get(
            "file_path",
            "source"
        )

        # ----------------------------------------------------
        # DIRECT CODE
        # ----------------------------------------------------

        if code:

            if not isinstance(
                code,
                str
            ):
                raise ValueError(
                    "code must be a string"
                )

            repository_file = (
                RepositoryFileContent(
                    path=file_path,
                    size=len(code.encode("utf-8")),
                    extension="",
                    language=language,
                    content=code,
                    truncated=False
                )
            )

            deterministic = (
                self.code_analysis_service.analyze_repository(
                    [repository_file]
                )
            )

            return await self._run_llm_analysis(
                task=task,
                files=[repository_file],
                deterministic=deterministic
            )

        # ----------------------------------------------------
        # REPOSITORY FILES
        # ----------------------------------------------------

        if repository_files:

            files = self._normalize_repository_files(
                repository_files
            )

            if not files:
                raise ValueError(
                    "repository_files contains no analyzable files"
                )

            deterministic = (
                self.code_analysis_service.analyze_repository(
                    files
                )
            )

            return await self._run_llm_analysis(
                task=task,
                files=files,
                deterministic=deterministic
            )

        raise ValueError(
            "Either 'code' or 'repository_files' "
            "is required for code analysis"
        )

    # ========================================================
    # NORMALIZE FILES
    # ========================================================

    def _normalize_repository_files(
        self,
        repository_files: Any
    ) -> List[RepositoryFileContent]:

        if not isinstance(
            repository_files,
            list
        ):
            raise ValueError(
                "repository_files must be a list"
            )

        result = []

        for item in repository_files:

            if isinstance(
                item,
                RepositoryFileContent
            ):

                result.append(
                    item
                )

                continue

            if not isinstance(
                item,
                dict
            ):
                continue

            try:

                result.append(
                    RepositoryFileContent(
                        path=item.get(
                            "path",
                            ""
                        ),
                        size=int(
                            item.get(
                                "size",
                                0
                            )
                            or 0
                        ),
                        extension=item.get(
                            "extension",
                            ""
                        ),
                        language=item.get(
                            "language"
                        ),
                        content=item.get(
                            "content",
                            ""
                        ),
                        truncated=bool(
                            item.get(
                                "truncated",
                                False
                            )
                        )
                    )
                )

            except Exception:
                continue

        return [
            file
            for file in result
            if file.path
            and file.content
            and not file.truncated
        ]

    # ========================================================
    # LLM ANALYSIS
    # ========================================================

    async def _run_llm_analysis(
        self,
        task: str,
        files: List[RepositoryFileContent],
        deterministic: DeterministicAnalysisResult
    ) -> CodeAnalysisResult:

        source_parts = []

        for file in files:

            source_parts.extend(
                [
                    f"FILE: {file.path}",
                    f"LANGUAGE: {file.language or 'Unknown'}",
                    "SOURCE:",
                    file.content,
                    "",
                    "----------------------------------------",
                    ""
                ]
            )

        source_code = "\n".join(
            source_parts
        )

        deterministic_json = json.dumps(
            deterministic.model_dump(),
            indent=2
        )

        prompt = f"""
You are the CodeGrowth AI Code Analysis Agent.

Analyze the provided student source code.

TASK:
{task}

You must evaluate these six dimensions:

1. Correctness
2. Code Quality
3. Complexity
4. Security
5. Testing
6. Documentation

IMPORTANT:

The deterministic analyzer has already checked the source
for obvious security and quality problems.

You must use those findings as evidence.

Do not invent problems that are not supported by the source.

SCORING:

0-20   = Very Poor
21-40  = Poor
41-60  = Average
61-80  = Good
81-100 = Excellent

Testing:

Do not assume tests exist.

Documentation:

Do not assume documentation exists.

Security:

If deterministic security findings exist, consider them
carefully when calculating the security score.

Repository deterministic analysis:

{deterministic_json}

SOURCE CODE:

{source_code}

Return ONLY valid JSON.

Do not return Markdown.

Return exactly these fields:

{{
    "correctness_score": number,
    "code_quality_score": number,
    "complexity_score": number,
    "security_score": number,
    "testing_score": number,
    "documentation_score": number,
    "overall_score": number,
    "strengths": [],
    "weaknesses": [],
    "improvement_suggestions": []
}}

All scores must be between 0 and 100.

All arrays must contain strings.

The overall score must be consistent with
the six dimension scores.
"""

        raw_result = (
            await self.llm_runtime.generate_json(
                prompt
            )
        )

        try:

            parsed_result = json.loads(
                raw_result
            )

        except json.JSONDecodeError as exc:

            raise RuntimeError(
                "AI returned invalid JSON"
            ) from exc

        try:

            validated = (
                CodeAnalysisResult.model_validate(
                    parsed_result
                )
            )

        except ValidationError as exc:

            raise RuntimeError(
                f"AI analysis failed validation: {exc}"
            ) from exc

        validated.deterministic_analysis = (
            deterministic
        )

        return validated