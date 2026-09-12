from pydantic import BaseModel, Field


class CodeAnalysisResult(BaseModel):

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

    security_score: float = Field(
        ge=0,
        le=100
    )

    testing_score: float = Field(
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

    strengths: list[str] = Field(
        default_factory=list
    )

    weaknesses: list[str] = Field(
        default_factory=list
    )

    improvement_suggestions: list[str] = Field(
        default_factory=list
    )