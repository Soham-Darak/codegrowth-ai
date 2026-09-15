from typing import Literal

from pydantic import BaseModel, Field


EvidenceType = Literal[
    "REST_ENDPOINT",
    "DATABASE",
    "VALIDATION",
    "TESTING",
    "JPA",
    "CODE_STRUCTURE",
    "UNKNOWN"
]


class EvidenceItem(BaseModel):

    type: EvidenceType

    requirement: str = Field(
        ...,
        min_length=1
    )

    found: bool

    evidence: list[str] = Field(
        default_factory=list
    )

    details: str = Field(
        default=""
    )


class EvidenceValidationResult(BaseModel):

    items: list[EvidenceItem] = Field(
        default_factory=list
    )

    total_requirements: int = Field(
        ge=0
    )

    satisfied_requirements: int = Field(
        ge=0
    )

    unsatisfied_requirements: int = Field(
        ge=0
    )   