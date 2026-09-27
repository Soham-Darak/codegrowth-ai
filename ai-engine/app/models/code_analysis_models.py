from typing import List, Optional

from pydantic import BaseModel, Field


# ============================================================
# CODE FINDING
# ============================================================

class CodeFinding(BaseModel):
    file: str

    line: Optional[int] = None

    category: str

    severity: str

    title: str

    description: str

    evidence: List[str] = Field(
        default_factory=list
    )

    suggestion: str


# ============================================================
# FILE ANALYSIS RESULT
# ============================================================

class FileAnalysisResult(BaseModel):
    path: str

    language: Optional[str] = None

    lines: int = Field(
        default=0,
        ge=0
    )

    findings: List[CodeFinding] = Field(
        default_factory=list
    )

    summary: str = ""


# ============================================================
# DETERMINISTIC REPOSITORY ANALYSIS
# ============================================================

class DeterministicAnalysisResult(BaseModel):
    total_files: int = 0

    analyzed_files: int = 0

    files_with_findings: int = 0

    total_findings: int = 0

    high_severity_findings: int = 0

    medium_severity_findings: int = 0

    low_severity_findings: int = 0

    info_findings: int = 0

    files: List[FileAnalysisResult] = Field(
        default_factory=list
    )


# ============================================================
# COMPLETE CODE ANALYSIS RESULT
# ============================================================

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

    strengths: List[str] = Field(
        default_factory=list
    )

    weaknesses: List[str] = Field(
        default_factory=list
    )

    improvement_suggestions: List[str] = Field(
        default_factory=list
    )

    deterministic_analysis: Optional[
        DeterministicAnalysisResult
    ] = None