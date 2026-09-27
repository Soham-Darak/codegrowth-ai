from typing import Any, Literal

from pydantic import (
    BaseModel,
    Field,
    field_validator,
    model_validator
)


RequirementStatus = Literal[
    "SATISFIED",
    "PARTIALLY_SATISFIED",
    "NOT_SATISFIED"
]


class RequirementResult(BaseModel):

    requirement: str = Field(
        ...,
        min_length=1
    )

    status: RequirementStatus

    score: float = Field(
        ge=0,
        le=100
    )

    evidence: list[str] = Field(
        default_factory=list
    )

    feedback: str = Field(
        default=""
    )

    # --------------------------------------------------
    # Normalize requirement status
    # --------------------------------------------------

    @field_validator(
        "status",
        mode="before"
    )
    @classmethod
    def normalize_status(
        cls,
        value: Any
    ) -> str:

        if not isinstance(value, str):

            raise ValueError(
                "Requirement status must be a string"
            )

        normalized = value.strip().upper()

        aliases = {
            "PARTIAL": "PARTIALLY_SATISFIED",
            "PARTIALLY SATISFIED": "PARTIALLY_SATISFIED",
            "NOT SATISFIED": "NOT_SATISFIED",
            "NOT-SATISFIED": "NOT_SATISFIED",
            "SATISFIED": "SATISFIED"
        }

        return aliases.get(
            normalized,
            normalized
        )

    # --------------------------------------------------
    # Normalize evidence
    # --------------------------------------------------

    @field_validator(
        "evidence",
        mode="before"
    )
    @classmethod
    def normalize_evidence(
        cls,
        value: Any
    ) -> list[str]:

        if value is None:
            return []

        if isinstance(value, str):
            return [value]

        if isinstance(value, list):

            return [
                str(item)
                for item in value
                if item is not None
            ]

        return [str(value)]

    # --------------------------------------------------
    # Validate status / score consistency
    # --------------------------------------------------

    @model_validator(
        mode="after"
    )
    def validate_consistency(self):

        if (
            self.status == "NOT_SATISFIED"
            and self.score != 0
        ):

            raise ValueError(
                "NOT_SATISFIED requirements must have a score of 0"
            )

        if (
            self.status == "PARTIALLY_SATISFIED"
            and (
                self.score <= 0
                or self.score >= 100
            )
        ):

            raise ValueError(
                "PARTIALLY_SATISFIED requirements "
                "must have a score between 1 and 99"
            )

        if (
            self.status == "SATISFIED"
            and self.score != 100
        ):

            raise ValueError(
                "SATISFIED requirements must have a score of 100"
            )

        return self


class EvaluationResult(BaseModel):

    correctness_score: float = Field(
        ge=0,
        le=100
    )

    code_quality_score: float = Field(
        ge=0,
        le=100
    )

    complexity_score: float = Field(
        ge=0,
        le=100
    )

    testing_score: float = Field(
        ge=0,
        le=100
    )

    security_score: float = Field(
        ge=0,
        le=100
    )

    documentation_score: float = Field(
        ge=0,
        le=100
    )

    overall_score: float = Field(
        ge=0,
        le=100
    )

    requirement_results: list[RequirementResult] = Field(
        default_factory=list
    )

    strengths: list[str] = Field(
        default_factory=list
    )

    weaknesses: list[str] = Field(
        default_factory=list
    )

    feedback: str = Field(
        default=""
    )

    improvement_suggestions: list[str] = Field(
        default_factory=list
    )