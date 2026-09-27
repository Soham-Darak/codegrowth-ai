from typing import List, Optional

from pydantic import BaseModel, Field


class RepositoryRequest(BaseModel):

    repository_url: str = Field(
        ...,
        min_length=1,
        description=(
            "Public or authorized GitHub repository URL"
        )
    )

    branch: Optional[str] = Field(
        default=None,
        description="Optional Git branch or tag"
    )


class RepositoryFile(BaseModel):

    path: str

    size: int

    extension: str

    language: Optional[str] = None


class RepositoryMetadata(BaseModel):

    owner: str

    name: str

    url: str

    branch: Optional[str] = None


class RepositoryStructure(BaseModel):

    metadata: RepositoryMetadata

    total_files: int = 0

    analyzed_files: int = 0

    skipped_files: int = 0

    files: List[RepositoryFile] = Field(
        default_factory=list
    )


class RepositoryAnalysisResult(BaseModel):

    status: str

    repository: RepositoryStructure

    message: str