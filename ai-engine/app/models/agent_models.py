from typing import Any, Dict, Optional

from pydantic import BaseModel, Field

from app.models.code_analysis_models import CodeAnalysisResult


class AgentRequest(BaseModel):

    task: str = Field(
        ...,
        min_length=1,
        description="Task that the AI system needs to perform"
    )

    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional information required by the agent"
    )


class AgentResponse(BaseModel):

    agent: str

    status: str

    result: CodeAnalysisResult