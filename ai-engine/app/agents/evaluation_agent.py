import json
from typing import Any, Dict

from pydantic import ValidationError

from app.agents.base_agent import BaseAgent
from app.agents.code_analysis_agent import CodeAnalysisAgent
from app.models.evaluation_models import EvaluationResult
from app.services.ollama_service import OllamaService


class EvaluationAgent(BaseAgent):

    name = "evaluation-agent"

    description = (
        "Evaluates student submissions against assignment requirements "
        "using technical code analysis and assignment context."
    )

    def __init__(
        self,
        code_analysis_agent: CodeAnalysisAgent,
        ollama_service: OllamaService
    ):
        self.code_analysis_agent = code_analysis_agent
        self.ollama_service = ollama_service

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> EvaluationResult:

        context = context or {}

        # --------------------------------------------------
        # Extract assignment
        # --------------------------------------------------

        assignment = context.get(
            "assignment",
            {}
        )

        code = context.get(
            "code",
            ""
        )

        # --------------------------------------------------
        # Validate code
        # --------------------------------------------------

        if not isinstance(code, str) or not code.strip():

            raise ValueError(
                "Student code is required for evaluation"
            )

        # --------------------------------------------------
        # Validate assignment
        # --------------------------------------------------

        if not isinstance(assignment, dict):

            raise ValueError(
                "Assignment context must be an object"
            )

        # --------------------------------------------------
        # Extract assignment fields
        # --------------------------------------------------

        title = assignment.get(
            "title",
            ""
        )

        description = assignment.get(
            "description",
            ""
        )

        requirements = assignment.get(
            "requirements",
            []
        )

        expected_concepts = assignment.get(
            "expected_concepts",
            []
        )

        # --------------------------------------------------
        # Normalize requirements
        # --------------------------------------------------

        if not isinstance(
            requirements,
            list
        ):

            requirements = [
                str(requirements)
            ]

        requirements = [
            str(requirement).strip()
            for requirement in requirements
            if str(requirement).strip()
        ]

        # --------------------------------------------------
        # Normalize expected concepts
        # --------------------------------------------------

        if not isinstance(
            expected_concepts,
            list
        ):

            expected_concepts = [
                str(expected_concepts)
            ]

        expected_concepts = [
            str(concept).strip()
            for concept in expected_concepts
            if str(concept).strip()
        ]

        # --------------------------------------------------
        # Require at least one assignment requirement
        # --------------------------------------------------

        if not requirements:

            raise ValueError(
                "Assignment must contain at least one requirement"
            )

        # --------------------------------------------------
        # Step 1:
        # Perform technical code analysis
        # --------------------------------------------------

        code_analysis = await self.code_analysis_agent.run(
            task=(
                "Perform a technical analysis of the student's "
                "submitted code before assignment evaluation."
            ),
            context={
                "code": code
            }
        )

        technical_analysis = (
            code_analysis.model_dump()
        )

        # --------------------------------------------------
        # Step 2:
        # Build evaluation prompt
        # --------------------------------------------------

        prompt_parts = [
            "You are the CodeGrowth AI Evaluation Agent.",
            "",
            "Your job is to evaluate a student's software "
            "engineering submission against the provided assignment.",
            "",
            "You must evaluate the submitted code using "
            "evidence-based reasoning.",
            "",
            "Do NOT assume that missing functionality exists.",
            "Do NOT invent functionality.",
            "Do NOT give credit for code that is not shown.",
            "",
            "Assignment Title:",
            str(title),
            "",
            "Assignment Description:",
            str(description),
            "",
            "Assignment Requirements:"
        ]

        # --------------------------------------------------
        # Add exact requirements
        # --------------------------------------------------

        for index, requirement in enumerate(
            requirements,
            start=1
        ):

            prompt_parts.append(
                f"{index}. {requirement}"
            )

        # --------------------------------------------------
        # Expected concepts
        # --------------------------------------------------

        prompt_parts.extend(
            [
                "",
                "Expected Concepts:"
            ]
        )

        if expected_concepts:

            for concept in expected_concepts:

                prompt_parts.append(
                    f"- {concept}"
                )

        else:

            prompt_parts.append(
                "No explicit expected concepts were provided."
            )

        # --------------------------------------------------
        # Student task
        # --------------------------------------------------

        prompt_parts.extend(
            [
                "",
                "Student Task:",
                task,
                "",
                "Student Source Code:",
                "```text",
                code,
                "```",
                "",
                "Technical Code Analysis:",
                json.dumps(
                    technical_analysis,
                    indent=2
                ),
                "",
                "IMPORTANT:",
                "The technical code analysis is supporting information.",
                "The submitted source code is the primary evidence.",
                "",
                "Evaluate the submission using these six dimensions:",
                "",
                "1. Correctness",
                "2. Code Quality",
                "3. Complexity",
                "4. Testing",
                "5. Security",
                "6. Documentation",
                "",
                "Each dimension must receive a score from 0 to 100.",
                "",
                "Then evaluate EVERY assignment requirement independently.",
                "",
                "Do not combine assignment requirements.",
                "Do not remove assignment requirements.",
                "Do not add assignment requirements.",
                "Do not invent assignment requirements.",
                "",
                "The six evaluation dimensions are NOT assignment requirements.",
                "Do not convert the six dimensions into requirement_results.",
                "",
                "STRICT REQUIREMENT EVALUATION RULES:",
                "",
                "1. Evaluate ONLY the assignment requirements explicitly provided above.",
                "",
                "2. Return EXACTLY one requirement_result for every assignment requirement.",
                "",
                "3. The number of requirement_results MUST equal the number of assignment requirements.",
                "",
                "4. Preserve the meaning of every assignment requirement.",
                "",
                "5. Evaluate every assignment requirement independently.",
                "",
                "6. A requirement is SATISFIED only when the submitted source code contains direct and sufficient evidence that the requirement is implemented.",
                "",
                "7. If the required implementation is absent from the submitted source code, the requirement MUST be NOT_SATISFIED.",
                "",
                "8. NOT_SATISFIED requirements MUST have score 0.",
                "",
                "9. PARTIALLY_SATISFIED should be used only when part of the requirement is clearly implemented.",
                "",
                "10. PARTIALLY_SATISFIED scores MUST be between 1 and 99.",
                "",
                "11. SATISFIED requirements MUST have score 100.",
                "",
                "12. Do not give partial credit merely because another related feature exists.",
                "",
                "13. Missing input validation must NOT make a POST endpoint itself partially satisfied if the POST endpoint exists.",
                "",
                "14. Missing error handling must NOT make a REST endpoint itself partially satisfied unless error handling is explicitly part of that requirement.",
                "",
                "15. Evidence MUST come from the submitted source code.",
                "",
                "16. Do not assume code exists elsewhere in the student's project.",
                "",
                "17. Do not assume a service, repository, database, configuration, endpoint, annotation, or method exists unless it is shown in the submitted source code.",
                "",
                "18. Do not infer implementation merely because a variable, class, or method has a suggestive name.",
                "",
                "19. For REST endpoint requirements, verify the HTTP mapping explicitly.",
                "",
                "POST endpoint → @PostMapping",
                "GET endpoint → @GetMapping",
                "PUT endpoint → @PutMapping",
                "DELETE endpoint → @DeleteMapping",
                "",
                "20. Never mark a PUT endpoint requirement SATISFIED unless @PutMapping or an equivalent explicit PUT implementation is present in the submitted source code.",
                "",
                "21. Never mark a DELETE endpoint requirement SATISFIED unless @DeleteMapping or an equivalent explicit DELETE implementation is present in the submitted source code.",
                "",
                "22. Never mark PostgreSQL integration SATISFIED unless sufficient PostgreSQL database integration is visible in the submitted source code.",
                "",
                "23. Never mark input validation SATISFIED unless actual validation logic is visible in the submitted source code.",
                "",
                "24. A requirement's status, score, evidence, and feedback MUST all support the same conclusion.",
                "",
                "25. Never claim that a requirement is implemented while simultaneously saying that its implementation is missing.",
                "",
                "26. If there is no direct evidence, choose NOT_SATISFIED.",
                "",
                "Requirement evidence rules:",
                "- Evidence must contain concrete observations from the submitted code.",
                "- Evidence must support the selected status.",
                "- If implementation is missing, explicitly state that it was not found.",
                "- Do not fabricate code evidence.",
                "",
                "Allowed requirement statuses:",
                "SATISFIED",
                "PARTIALLY_SATISFIED",
                "NOT_SATISFIED",
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
                "- General feedback",
                "- Improvement suggestions",
                "",
                "Final consistency checklist:",
                "",
                "1. Count the assignment requirements.",
                "2. Return exactly the same number of requirement_results.",
                "3. Preserve every requirement.",
                "4. Inspect the submitted code for direct evidence.",
                "5. Mark missing implementations NOT_SATISFIED.",
                "6. Mark NOT_SATISFIED requirements with score 0.",
                "7. Mark SATISFIED requirements with score 100.",
                "8. Mark PARTIALLY_SATISFIED requirements with a score from 1 to 99.",
                "9. Ensure evidence agrees with status.",
                "10. Ensure feedback agrees with status.",
                "11. Do not invent functionality.",
                "12. Do not invent assignment requirements.",
                "",
                "Return ONLY valid JSON.",
                "Do not return Markdown.",
                "Do not use a JSON code block.",
                "Do not include explanations outside the JSON.",
                "",
                "Strengths must be an array of strings.",
                "Weaknesses must be an array of strings.",
                "Improvement suggestions must be an array of strings.",
                "Requirement results must be an array.",
                "",
                "Return exactly these fields:",
                "",
                "correctness_score",
                "code_quality_score",
                "complexity_score",
                "testing_score",
                "security_score",
                "documentation_score",
                "overall_score",
                "requirement_results",
                "strengths",
                "weaknesses",
                "feedback",
                "improvement_suggestions"
            ]
        )

        prompt = "\n".join(
            prompt_parts
        )

        # --------------------------------------------------
        # Step 3:
        # Ask Ollama for structured evaluation
        # --------------------------------------------------

        raw_result = await self.ollama_service.generate_json(
            prompt
        )

        # --------------------------------------------------
        # Step 4:
        # Parse JSON
        # --------------------------------------------------

        try:

            parsed_result = json.loads(
                raw_result
            )

        except json.JSONDecodeError as exc:

            raise RuntimeError(
                "AI returned invalid evaluation JSON"
            ) from exc

        # --------------------------------------------------
        # Step 5:
        # Validate result structure
        # --------------------------------------------------

        try:

            validated_result = (
                EvaluationResult.model_validate(
                    parsed_result
                )
            )

        except ValidationError as exc:

            raise RuntimeError(
                f"AI evaluation failed validation: {exc}"
            ) from exc

        # --------------------------------------------------
        # Step 6:
        # Validate requirement count
        # --------------------------------------------------

        actual_count = len(
            validated_result.requirement_results
        )

        expected_count = len(
            requirements
        )

        if actual_count != expected_count:

            raise RuntimeError(
                "AI evaluation returned "
                f"{actual_count} requirement results, "
                f"but the assignment contains "
                f"{expected_count} requirements"
            )

        # --------------------------------------------------
        # Step 7:
        # Return validated result
        # --------------------------------------------------

        return validated_result