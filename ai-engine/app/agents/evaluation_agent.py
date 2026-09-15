import json
from typing import Any, Dict

from pydantic import ValidationError

from app.agents.base_agent import BaseAgent
from app.agents.code_analysis_agent import CodeAnalysisAgent
from app.models.evaluation_models import EvaluationResult
from app.services.evidence_validator import EvidenceValidator
from app.services.ollama_service import OllamaService


class EvaluationAgent(BaseAgent):

    name = "evaluation-agent"

    description = (
        "Evaluates student submissions against assignment "
        "requirements using deterministic evidence, "
        "technical code analysis and assignment context."
    )

    def __init__(
        self,
        code_analysis_agent: CodeAnalysisAgent,
        ollama_service: OllamaService,
        evidence_validator: EvidenceValidator
    ):
        self.code_analysis_agent = code_analysis_agent
        self.ollama_service = ollama_service
        self.evidence_validator = evidence_validator

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> EvaluationResult:

        context = context or {}

        # ==================================================
        # EXTRACT INPUT
        # ==================================================

        assignment = context.get("assignment", {})
        code = context.get("code", "")

        if not isinstance(code, str) or not code.strip():
            raise ValueError(
                "Student code is required for evaluation"
            )

        if not isinstance(assignment, dict):
            raise ValueError(
                "Assignment context must be an object"
            )

        # ==================================================
        # EXTRACT ASSIGNMENT INFORMATION
        # ==================================================

        title = assignment.get("title", "")
        description = assignment.get("description", "")
        requirements = assignment.get("requirements", [])
        expected_concepts = assignment.get(
            "expected_concepts",
            []
        )

        # ==================================================
        # NORMALIZE REQUIREMENTS
        # ==================================================

        if not isinstance(requirements, list):
            requirements = [str(requirements)]

        requirements = [
            str(requirement).strip()
            for requirement in requirements
            if str(requirement).strip()
        ]

        if not requirements:
            raise ValueError(
                "Assignment must contain at least one requirement"
            )

        # ==================================================
        # NORMALIZE EXPECTED CONCEPTS
        # ==================================================

        if not isinstance(expected_concepts, list):
            expected_concepts = [
                str(expected_concepts)
            ]

        expected_concepts = [
            str(concept).strip()
            for concept in expected_concepts
            if str(concept).strip()
        ]

        # ==================================================
        # STEP 1
        # DETERMINISTIC EVIDENCE VALIDATION
        # ==================================================

        evidence_validation = (
            self.evidence_validator.validate(
                code,
                requirements
            )
        )

        deterministic_evidence = (
            evidence_validation.model_dump()
        )

        # ==================================================
        # STEP 2
        # TECHNICAL CODE ANALYSIS
        # ==================================================

        code_analysis = await self.code_analysis_agent.run(
            task=(
                "Perform a technical analysis of the "
                "student's submitted code before "
                "assignment evaluation."
            ),
            context={
                "code": code
            }
        )

        technical_analysis = code_analysis.model_dump()

        # ==================================================
        # STEP 3
        # BUILD EVALUATION PROMPT
        # ==================================================

        prompt_parts = []

        prompt_parts.append(
            "You are the CodeGrowth AI Evaluation Agent."
        )

        prompt_parts.append("")

        prompt_parts.append(
            "Your job is to evaluate a student's "
            "software engineering submission against "
            "the provided assignment."
        )

        prompt_parts.append("")

        prompt_parts.append(
            "Use evidence-based reasoning."
        )

        prompt_parts.append(
            "Do NOT assume missing functionality exists."
        )

        prompt_parts.append(
            "Do NOT invent functionality."
        )

        prompt_parts.append(
            "Do NOT give credit for code that is not shown."
        )

        prompt_parts.append("")

        # --------------------------------------------------
        # Assignment
        # --------------------------------------------------

        prompt_parts.append("Assignment Title:")
        prompt_parts.append(str(title))

        prompt_parts.append("")

        prompt_parts.append("Assignment Description:")
        prompt_parts.append(str(description))

        prompt_parts.append("")

        prompt_parts.append("Assignment Requirements:")

        for index, requirement in enumerate(
            requirements,
            start=1
        ):
            prompt_parts.append(
                f"{index}. {requirement}"
            )

        prompt_parts.append("")

        # --------------------------------------------------
        # Expected concepts
        # --------------------------------------------------

        prompt_parts.append("Expected Concepts:")

        if expected_concepts:

            for concept in expected_concepts:
                prompt_parts.append(
                    f"- {concept}"
                )

        else:

            prompt_parts.append(
                "No explicit expected concepts were provided."
            )

        prompt_parts.append("")

        # --------------------------------------------------
        # Student task
        # --------------------------------------------------

        prompt_parts.append("Student Task:")
        prompt_parts.append(task)

        prompt_parts.append("")

        # --------------------------------------------------
        # Student code
        # --------------------------------------------------

        prompt_parts.append("Student Source Code:")
        prompt_parts.append("```text")
        prompt_parts.append(code)
        prompt_parts.append("```")

        prompt_parts.append("")

        # --------------------------------------------------
        # Deterministic evidence
        # --------------------------------------------------

        prompt_parts.append(
            "Deterministic Evidence Validation:"
        )

        prompt_parts.append(
            json.dumps(
                deterministic_evidence,
                indent=2
            )
        )

        prompt_parts.append("")

        # --------------------------------------------------
        # Technical analysis
        # --------------------------------------------------

        prompt_parts.append(
            "Technical Code Analysis:"
        )

        prompt_parts.append(
            json.dumps(
                technical_analysis,
                indent=2
            )
        )

        prompt_parts.append("")

        # ==================================================
        # EVIDENCE RULES
        # ==================================================

        evidence_rules = [
            "IMPORTANT DETERMINISTIC EVIDENCE RULES:",

            "",

            (
                "The deterministic evidence validation is "
                "authoritative for the presence or absence "
                "of explicitly detectable code constructs."
            ),

            (
                "The technical code analysis is supporting "
                "information."
            ),

            (
                "The submitted source code is the primary "
                "evidence."
            ),

            "",

            "1. Do not contradict deterministic evidence.",

            (
                "2. If deterministic evidence says a "
                "requirement's explicit implementation was "
                "NOT FOUND, do not mark that requirement "
                "SATISFIED."
            ),

            (
                "3. If deterministic evidence says a "
                "requirement's explicit implementation was "
                "FOUND, use that evidence when evaluating "
                "the requirement."
            ),

            (
                "4. Deterministic evidence establishes "
                "whether a detectable construct is present. "
                "It does not by itself establish whether "
                "the implementation is high quality."
            ),

            (
                "5. For UNKNOWN evidence types, do not "
                "automatically treat the requirement as "
                "failed. Use source-code reasoning only "
                "when sufficient evidence is available."
            ),

            "",

            "Evaluate these six dimensions:",

            "1. Correctness",
            "2. Code Quality",
            "3. Complexity",
            "4. Testing",
            "5. Security",
            "6. Documentation",

            "",

            (
                "Each dimension must receive a score "
                "from 0 to 100."
            ),

            "",

            (
                "Then evaluate EVERY assignment requirement "
                "independently."
            ),

            "",

            "Do not combine assignment requirements.",
            "Do not remove assignment requirements.",
            "Do not add assignment requirements.",

            "",

            (
                "The six evaluation dimensions are NOT "
                "assignment requirements."
            ),

            (
                "Do not convert the six dimensions into "
                "requirement_results."
            ),

            "",

            "STRICT REQUIREMENT RULES:",

            "",

            (
                "6. A requirement is SATISFIED only when "
                "the submitted source code contains direct "
                "and sufficient evidence that the requirement "
                "is implemented."
            ),

            (
                "6A. When deterministic evidence explicitly "
                "reports that a detectable requirement "
                "construct was NOT FOUND, the requirement "
                "cannot be SATISFIED."
            ),

            (
                "6B. When deterministic evidence explicitly "
                "reports that a requirement construct was "
                "FOUND, that evidence must be reflected in "
                "the requirement evaluation."
            ),

            (
                "7. If the required implementation is absent "
                "from the submitted source code, the "
                "requirement MUST be NOT_SATISFIED."
            ),

            (
                "8. NOT_SATISFIED requirements MUST have "
                "score 0."
            ),

            (
                "9. PARTIALLY_SATISFIED should be used only "
                "when part of the requirement is clearly "
                "implemented."
            ),

            (
                "10. PARTIALLY_SATISFIED scores MUST be "
                "between 1 and 99."
            ),

            (
                "11. SATISFIED requirements MUST have "
                "score 100."
            ),

            (
                "12. Do not give partial credit merely "
                "because another related feature exists."
            ),

            (
                "13. Missing input validation must NOT make "
                "a POST endpoint itself partially satisfied "
                "if the POST endpoint exists."
            ),

            (
                "14. Missing error handling must NOT make "
                "a REST endpoint itself partially satisfied "
                "unless error handling is explicitly part "
                "of that requirement."
            ),

            (
                "15. Evidence MUST come from the submitted "
                "source code."
            ),

            (
                "16. Do not assume code exists elsewhere "
                "in the student's project."
            ),

            (
                "17. Do not assume a service, repository, "
                "database, configuration, endpoint, "
                "annotation, or method exists unless it is "
                "shown in the submitted source code."
            ),

            (
                "18. Do not infer implementation merely "
                "because a variable, class, or method has "
                "a suggestive name."
            ),

            (
                "19. For REST endpoint requirements, verify "
                "the HTTP mapping explicitly."
            ),

            "POST endpoint → @PostMapping",
            "GET endpoint → @GetMapping",
            "PUT endpoint → @PutMapping",
            "DELETE endpoint → @DeleteMapping",

            (
                "20. Never mark a PUT endpoint requirement "
                "SATISFIED unless @PutMapping or an equivalent "
                "explicit PUT implementation is present."
            ),

            (
                "21. Never mark a DELETE endpoint requirement "
                "SATISFIED unless @DeleteMapping or an equivalent "
                "explicit DELETE implementation is present."
            ),

            (
                "22. Never mark PostgreSQL integration "
                "SATISFIED unless sufficient PostgreSQL "
                "integration is visible in the submitted code."
            ),

            (
                "23. Never mark input validation SATISFIED "
                "unless actual validation logic is visible "
                "in the submitted code."
            ),

            (
                "24. A requirement's status, score, evidence "
                "and feedback MUST all support the same "
                "conclusion."
            ),

            (
                "25. Never claim that a requirement is "
                "implemented while simultaneously saying "
                "that its implementation is missing."
            ),

            (
                "26. If there is no direct evidence, choose "
                "NOT_SATISFIED for requirements that have "
                "deterministic validation support."
            ),

            "",

            "Requirement evidence rules:",

            (
                "- Evidence must contain concrete "
                "observations from the submitted code."
            ),

            (
                "- Evidence must support the selected status."
            ),

            (
                "- If implementation is missing, explicitly "
                "state that it was not found."
            ),

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
            "81-100 = Excellent"
        ]

        prompt_parts.extend(
            evidence_rules
        )

        # ==================================================
        # OUTPUT RULES
        # ==================================================

        output_rules = [
            "",

            "OUTPUT REQUIREMENTS:",

            "",

            (
                "Return exactly one requirement_result "
                "for every assignment requirement."
            ),

            (
                "The number of requirement_results MUST "
                "equal the number of assignment requirements."
            ),

            (
                "Preserve the original meaning of every "
                "assignment requirement."
            ),

            "",

            "Provide:",

            "- Overall score",
            "- Strengths",
            "- Weaknesses",
            "- General feedback",
            "- Improvement suggestions",

            "",

            (
                "Strengths must be an array of strings."
            ),

            (
                "Weaknesses must be an array of strings."
            ),

            (
                "Improvement suggestions must be an "
                "array of strings."
            ),

            (
                "Requirement results must be an array."
            ),

            "",

            "Return exactly these JSON fields:",

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
            "improvement_suggestions",

            "",

            "Return ONLY valid JSON.",
            "Do not return Markdown.",
            "Do not use a JSON code block.",
            "Do not include explanations outside the JSON."
        ]

        prompt_parts.extend(
            output_rules
        )

        prompt = "\n".join(
            prompt_parts
        )

        # ==================================================
        # STEP 4
        # CALL OLLAMA
        # ==================================================

        raw_result = (
            await self.ollama_service.generate_json(
                prompt
            )
        )

        # ==================================================
        # STEP 5
        # PARSE JSON
        # ==================================================

        try:

            parsed_result = json.loads(
                raw_result
            )

        except json.JSONDecodeError as exc:

            raise RuntimeError(
                "AI returned invalid evaluation JSON"
            ) from exc

        # ==================================================
        # STEP 6
        # PYDANTIC VALIDATION
        # ==================================================

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

        # ==================================================
        # STEP 7
        # REQUIREMENT COUNT VALIDATION
        # ==================================================

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
                "but the assignment contains "
                f"{expected_count} requirements"
            )

        # ==================================================
        # STEP 8
        # DETERMINISTIC NORMALIZATION
        # ==================================================

        normalized_result = (
            self._normalize_evaluation_result(
                validated_result,
                evidence_validation
            )
        )

        # ==================================================
        # STEP 9
        # FINAL CONSISTENCY VALIDATION
        # ==================================================

        self._validate_final_consistency(
            normalized_result
        )

        return normalized_result

    # ==================================================
    # DETERMINISTIC NORMALIZATION
    # ==================================================

    def _normalize_evaluation_result(
        self,
        evaluation_result: EvaluationResult,
        evidence_validation
    ) -> EvaluationResult:

        evidence_by_requirement = {
            item.requirement.strip().lower(): item
            for item in evidence_validation.items
        }

        for requirement_result in (
            evaluation_result.requirement_results
        ):

            key = (
                requirement_result.requirement
                .strip()
                .lower()
            )

            evidence_item = (
                evidence_by_requirement.get(key)
            )

            if evidence_item is None:
                continue

            # --------------------------------------------------
            # Deterministic evidence says NOT FOUND
            # --------------------------------------------------

            if (
                evidence_item.type != "UNKNOWN"
                and not evidence_item.found
            ):

                requirement_result.status = (
                    "NOT_SATISFIED"
                )

                requirement_result.score = 0

                requirement_result.evidence = []

                requirement_result.feedback = (
                    evidence_item.details
                )

            # --------------------------------------------------
            # Deterministic evidence says FOUND
            # --------------------------------------------------

            elif evidence_item.found:

                requirement_result.evidence = (
                    evidence_item.evidence
                )

                if not requirement_result.feedback.strip():

                    requirement_result.feedback = (
                        evidence_item.details
                    )

        # ==================================================
        # CALCULATE OVERALL SCORE
        # ==================================================

        dimension_scores = [
            evaluation_result.correctness_score,
            evaluation_result.code_quality_score,
            evaluation_result.complexity_score,
            evaluation_result.testing_score,
            evaluation_result.security_score,
            evaluation_result.documentation_score
        ]

        evaluation_result.overall_score = round(
            sum(dimension_scores)
            / len(dimension_scores),
            2
        )

        return evaluation_result

    # ==================================================
    # FINAL CONSISTENCY VALIDATION
    # ==================================================

    def _validate_final_consistency(
        self,
        evaluation_result: EvaluationResult
    ) -> None:

        for requirement_result in (
            evaluation_result.requirement_results
        ):

            # --------------------------------------------------
            # NOT SATISFIED
            # --------------------------------------------------

            if (
                requirement_result.status
                == "NOT_SATISFIED"
                and requirement_result.score != 0
            ):

                raise RuntimeError(
                    "Invalid final evaluation: "
                    "NOT_SATISFIED requirement must have "
                    "score 0"
                )

            # --------------------------------------------------
            # SATISFIED
            # --------------------------------------------------

            if (
                requirement_result.status
                == "SATISFIED"
                and requirement_result.score != 100
            ):

                raise RuntimeError(
                    "Invalid final evaluation: "
                    "SATISFIED requirement must have "
                    "score 100"
                )

            # --------------------------------------------------
            # PARTIALLY SATISFIED
            # --------------------------------------------------

            if (
                requirement_result.status
                == "PARTIALLY_SATISFIED"
                and not (
                    0
                    < requirement_result.score
                    < 100
                )
            ):

                raise RuntimeError(
                    "Invalid final evaluation: "
                    "PARTIALLY_SATISFIED requirement "
                    "must have score between 1 and 99"
                )