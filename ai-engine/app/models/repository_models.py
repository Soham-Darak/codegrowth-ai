from typing import Dict, List, Optional

from pydantic import BaseModel, Field


# ==========================================================
# REPOSITORY REQUEST
# ==========================================================

class RepositoryRequest(BaseModel):
    repository_url: str = Field(
        ...,
        min_length=1,
        description="GitHub repository URL",
    )

    branch: Optional[str] = Field(
        default=None,
        description="Git branch or tag. Uses the default branch when omitted.",
    )

    include_contents: bool = Field(
        default=True,
        description="Whether source file contents should be retrieved.",
    )

    max_files: Optional[int] = Field(
        default=None,
        ge=1,
        le=500,
        description="Maximum number of files to inspect.",
    )


# ==========================================================
# REPOSITORY FILE METADATA
# ==========================================================

class RepositoryFile(BaseModel):
    path: str

    size: int = Field(
        default=0,
        ge=0,
    )

    extension: str = ""

    language: Optional[str] = None


# ==========================================================
# REPOSITORY FILE CONTENT
# ==========================================================

class RepositoryFileContent(BaseModel):
    path: str

    size: int = Field(
        default=0,
        ge=0,
    )

    extension: str = ""

    language: Optional[str] = None

    content: str = ""

    truncated: bool = False


# ==========================================================
# REPOSITORY METADATA
# ==========================================================

class RepositoryMetadata(BaseModel):
    owner: str

    name: str

    url: str

    branch: Optional[str] = None

    description: Optional[str] = None

    default_branch: Optional[str] = None

    private: bool = False

    fork: bool = False

    stars: int = Field(
        default=0,
        ge=0,
    )

    forks: int = Field(
        default=0,
        ge=0,
    )

    open_issues: int = Field(
        default=0,
        ge=0,
    )


# ==========================================================
# REPOSITORY STATISTICS
# ==========================================================

class RepositoryStatistics(BaseModel):
    """
    Aggregate statistics generated during repository inspection.
    """

    total_files: int = Field(
        default=0,
        ge=0,
    )

    analyzed_files: int = Field(
        default=0,
        ge=0,
    )

    skipped_files: int = Field(
        default=0,
        ge=0,
    )

    total_source_files: int = Field(
        default=0,
        ge=0,
    )

    total_source_bytes: int = Field(
        default=0,
        ge=0,
    )

    languages: Dict[str, int] = Field(
        default_factory=dict,
    )


# ==========================================================
# REPOSITORY STRUCTURE
# ==========================================================

class RepositoryStructure(BaseModel):
    metadata: RepositoryMetadata

    statistics: RepositoryStatistics = Field(
        default_factory=RepositoryStatistics,
    )

    files: List[RepositoryFile] = Field(
        default_factory=list,
    )

    contents: List[RepositoryFileContent] = Field(
        default_factory=list,
    )

    @property
    def total_files(self) -> int:
        return self.statistics.total_files

    @property
    def analyzed_files(self) -> int:
        return self.statistics.analyzed_files

    @property
    def skipped_files(self) -> int:
        return self.statistics.skipped_files


# ==========================================================
# REPOSITORY CONTENT
# ==========================================================

class RepositoryContent(BaseModel):
    metadata: RepositoryMetadata

    total_files: int = Field(
        default=0,
        ge=0,
    )

    analyzed_files: int = Field(
        default=0,
        ge=0,
    )

    skipped_files: int = Field(
        default=0,
        ge=0,
    )

    total_content_size: int = Field(
        default=0,
        ge=0,
    )

    files: List[RepositoryFileContent] = Field(
        default_factory=list,
    )


# ==========================================================
# REPOSITORY ANALYSIS RESULT
# ==========================================================

class RepositoryAnalysisResult(BaseModel):
    status: str

    repository: RepositoryStructure

    message: Optional[str] = None